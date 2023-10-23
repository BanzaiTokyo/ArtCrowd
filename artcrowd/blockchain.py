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
        ops = [contract.create_project(project.id, project.share_price * 1_000_000)]
    # change to "else" when updated contract is deployed
    ops.append(contract.update_project_status(project.status, project.id))
    tezos.bulk(*ops).send(min_confirmations=0)


def update_project_status(project: models.Model):
    contract = tezos.contract(settings.PROJECTS_CONTRACT)
    ops = [contract.update_project_status(project.status, project.id)]
    tezos.bulk(*ops).send(min_confirmations=0)


def refund(project: models.Model):
    contract = tezos.contract(settings.PROJECTS_CONTRACT)
    wallets = list(set([s.patron.tzwallet for s in project.shares]))
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
    for share in project.shares:
        shares[share.patron.tzwallet] += share.quantity
    wallets = list(shares.keys())
    ops = [
        contract.update_project_status(project.status, project.id),
        contract.withdraw_mutez(project.artist.tzwallet, project.shares_sum * 1_000_000)
    ]
    token_generated = False
    for i in range(0, len(wallets), 500):
        params = [{"token": {"existing": token_id}, "amount": shares[wallet], "to_": wallet} for wallet in wallets[i: i+500]]
        if not token_generated:
            params[0]["token"] = {"new": {"": meta_url}}
            token_generated = True
        ops.append(contract.mint(params))
    result = tezos.bulk(*ops).send(min_confirmations=0)
    return result


def get_bought_shares(op_hash, block_hash):
    block = tezos.shell.blocks[block_hash]()
    tezos_op = next((op for oplist in block['operations'] for op in oplist if op['hash'] == op_hash), None)
    if tezos_op:
        params = tezos_op['contents'][0]
        if params['destination'] == settings.PROJECTS_CONTRACT:
            return params['parameters']['value']['args'][0]['int'], params['source']
    raise Exception(f'operation {op_hash} not found')


def buy_shares(project, num_shares):
    contract = tezos.contract(settings.PROJECTS_CONTRACT)
    op = contract.buy_shares(num_shares, project.id).with_amount(num_shares*project.share_price).send(min_confirmations=1)
