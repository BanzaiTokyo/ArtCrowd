from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from unittest.mock import patch
from artcrowd import models, serializers


class BuySharesViewTestCase(TestCase):
    def setUp(self):
        self.project = models.Project.objects.create(
            title='Test Project',
            share_price=10,
            max_shares=100,
        )
        self.url = reverse('buy_shares', args=[self.project.id])
        self.data = {
            'wallet': 'wallet_address',
            'quantity': 10,
            'ophash': 'ophash_value',
        }

    ## Happy path
    @patch('blockchain.get_wallet_money')
    @patch('blockchain.get_bought_shares')
    @patch('blockchain.buy_shares')
    def test_buy_shares_success(self, mock_buy_shares, mock_get_bought_shares, mock_get_wallet_money):
        mock_get_wallet_money.return_value = 1000
        mock_get_bought_shares.return_value = 50
        response = self.client.post(self.url, self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        mock_buy_shares.assert_called_once_with(self.project, self.data['wallet'], self.data['quantity'])

    ## BadRequest is raised
    @patch('blockchain.get_wallet_money')
    @patch('blockchain.get_bought_shares')
    @patch('blockchain.refund')
    def test_buy_shares_not_enough_money(self, mock_refund, mock_get_bought_shares, mock_get_wallet_money):
        mock_get_wallet_money.return_value = 50
        mock_get_bought_shares.return_value = 50
        response = self.client.post(self.url, self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {'detail': 'Not enough money'})
        mock_refund.assert_called_once_with(self.project, self.data['wallet'])

    @patch('blockchain.get_wallet_money')
    @patch('blockchain.get_bought_shares')
    @patch('blockchain.refund')
    def test_buy_shares_max_shares_exceeded(self, mock_refund, mock_get_bought_shares, mock_get_wallet_money):
        mock_get_wallet_money.return_value = 1000
        mock_get_bought_shares.return_value = 90
        response = self.client.post(self.url, self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {'detail': 'There are only 10 shares left to buy'})
        mock_refund.assert_called_once_with(self.project, self.data['wallet'])
