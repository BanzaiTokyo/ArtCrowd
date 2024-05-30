import logging
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from . import blockchain

User = get_user_model()


class WalletAuthBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if not blockchain.validate_signature(wallet=username, signature=password, message=kwargs.get('message')):
            logging.warning('failed to validate signature')
            return None
        user = User.get_or_create_from_wallet(username)
        return user
