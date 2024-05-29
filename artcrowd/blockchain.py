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
        if not public_key:
            raise Exception(f'unable to get public key for {wallet}')
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


def update_project_status(project: models.Model, confirmations=0):
    contract = tezos.contract(settings.PROJECTS_CONTRACT)
    ops = [contract.update_project_status(project.status, project.id)]
    tezos.bulk(*ops).send(min_confirmations=confirmations)


def refund_all(project: models.Model):
    contract = tezos.contract(settings.PROJECTS_CONTRACT)
    wallets = list(set([s.patron.tzwallet for s in project.shares]))
    ops = [contract.refund(project.id, wallets[i: i+500]) for i in range(0, len(wallets), 500)]
    ops.append(contract.update_project_status(project.status, project.id))
    result = tezos.bulk(*ops).send(min_confirmations=0)
    return result


def generate_token(project: models.Model, metadata_url, patron: models.Model):
    contract = tezos.contract(settings.PROJECTS_CONTRACT)
    gallery_contract = tezos.contract(settings.GALLERY_CONTRACT)
    # upload meta
    meta_url = metadata_url.encode()
    shares = project.shares.filter(project=project, patron=patron).aggregate(models.Sum('quantity'))
    params = {"token": {"new": {"": meta_url}}, "amount": shares, "to_": patron.tzwallet}
    gallery_contract.mint(params).send(min_confirmations=0)


def generate_tokens(project: models.Model, metadata_url):
    contract = tezos.contract(settings.PROJECTS_CONTRACT)
    gallery_contract = tezos.contract(settings.GALLERY_CONTRACT)
    token_id = gallery_contract.storage['next_token_id']()
    # upload meta
    meta_url = metadata_url.encode()
    shares = defaultdict(int)
    for share in project.shares:
        shares[share.patron.tzwallet] += share.quantity
    wallets = list(shares.keys())
    ops = [
        contract.update_project_status(project.status, project.id),
        contract.withdraw_mutez(project.shares_sum * 1_000_000, project.artist.tzwallet)
    ]
    token_generated = False
    for i in range(0, len(wallets), 500):
        params = [{"token": {"existing": token_id}, "amount": shares[wallet], "to_": wallet} for wallet in wallets[i: i+500]]
        if not token_generated:
            params[0]["token"] = {"new": {"": meta_url}}
            token_generated = True
        ops.append(gallery_contract.mint(params))
    result = tezos.bulk(*ops).send(min_confirmations=0)
    return result


def get_wallet_money(wallet):
    contract = tezos.contract(settings.PROJECTS_CONTRACT)
    money = contract.storage['ledger'].get(wallet)
    return money or 0


def refund(wallet):
    contract = tezos.contract(settings.PROJECTS_CONTRACT)
    op = contract.refund(wallet).send(min_confirmations=0)


def get_bought_shares(project: models.Model):
    contract = tezos.contract(settings.PROJECTS_CONTRACT)
    project_data = contract.storage['projects'].get(project.id)
    return project_data.get('total_shares')


def buy_shares(project, wallet, num_shares):
    contract = tezos.contract(settings.PROJECTS_CONTRACT)
    op = contract.buy_shares((num_shares, wallet), project.id).send(min_confirmations=1)
