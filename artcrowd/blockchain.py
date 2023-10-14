import json
import logging
import time
from datetime import datetime
from collections import defaultdict
import requests
from pytezos import pytezos
from pytezos.crypto.key import Key
from django.conf import settings
from django.db import models

with open(settings.TEZOS_WALLET_KEYFILE, 'rt') as fp:
    keyfile = json.load(fp)
tezos = pytezos.using(shell=settings.TEZOS_NETWORK, key=keyfile['edsk'])


def validate_signature(wallet, signature, message):
    try:
        public_key = tezos.shell.contracts[wallet].manager_key()
        return Key.from_encoded_key(public_key).verify(signature, message)
    except Exception as ex:
        logging.warning(ex)
    return False


def create_project(project: models.Model):
    contract = tezos.contract(settings.PROJECTS_CONTRACT)
    ops = []
    try:
        contract.storage['projects'][project.id]
    except KeyError:
        ops.append(contract.create_project(project.id, project.share_price * 1_000_000))
    #ops.append(contract.update_project_status(project.status, project.id))
    tezos.bulk(*ops).send(min_confirmations=0)


def update_project_status(project: models.Model):
    contract = tezos.contract(settings.PROJECTS_CONTRACT)
    ops = [contract.update_project_status(project.status, project.id)]
    tezos.bulk(*ops).send(min_confirmations=0)


def refund(project: models.Model):
    contract = tezos.contract(settings.PROJECTS_CONTRACT)
    wallets = list(set([s.patron.tzwallet for s in project.sorted_shares]))
    ops = [contract.refund(project.id, wallets[i: i+500]) for i in range(0, len(wallets), 500)]
    ops.append(contract.update_project_status(project.status, project.id))
    result = tezos.bulk(*ops).send(min_confirmations=0)
    return result


def generate_tokens(project: models.Model, metadata_url):
    contract = tezos.contract(settings.GALLERY_CONTRACT)
    token_id = contract.storage['next_token_id']()
    # upload meta
    meta_url = metadata_url.encode()
    shares = defaultdict(int)
    for share in project.sorted_shares:
        shares[share.patron.tzwallet] += share.quantity
    wallets = list(shares.keys())
    ops = [contract.update_project_status(project.status, project.id)]
    token_generated = False
    for i in range(0, len(wallets), 500):
        params = [{"token": {"existing": token_id}, "amount": shares[wallet], "to_": wallet} for wallet in wallets[i: i+500]]
        if not token_generated:
            params[0]["token"] = {"new": {"": meta_url}}
            token_generated = True
        ops.append(contract.mint(params))
    result = tezos.bulk(*ops).send(min_confirmations=0)
    return result


def get_bought_shares(ophash):
    for i in range(3):
        tezos_op = requests.get(settings.TEZOS_API + 'op/' + ophash).json()
        if isinstance(tezos_op, list):
            return tezos_op[0]['parameters']['value']['num_shares'], tezos_op[0]['sender']
        time.sleep(5)
    raise Exception(f'operation {ophash} not found')


def buy_shares(project, num_shares):
    contract = tezos.contract(settings.PROJECTS_CONTRACT)
    op = contract.buy_shares(num_shares, project.id).with_amount(num_shares*project.share_price).send(min_confirmations=1)
