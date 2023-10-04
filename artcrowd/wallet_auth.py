from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from . import blockchain

User = get_user_model()


class WalletAuthBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if not blockchain.validate_signature(wallet=username, signature=password, message=kwargs.get('message')):
            return None
        user = User.objects.filter(tzwallet=username).first()
        if not user:
            user = User(username=username, tzwallet=username)
            user.save()
        return user
