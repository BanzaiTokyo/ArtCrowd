from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from unittest.mock import patch
from artcrowd.models import User, Group, Project, ProjectUpdate, Share


class TestProjectsListView(APITestCase):
    def setUp(self):
        self.artist1 = User.objects.create_user(username='artist1', password='password')
        self.artist2 = User.objects.create_user(username='artist2', password='password')
        self.presenter = User.objects.create_user(username='presenter', password='password')
        self.patron = User.objects.create_user(username='patron', password='password')

        self.project1 = Project.objects.create(artist=self.artist1, presenter=self.presenter, status=Project.OPEN)
        self.project2 = Project.objects.create(artist=self.artist2, presenter=self.presenter, status=Project.COMPLETED)
        self.project3 = Project.objects.create(artist=self.artist1, presenter=self.presenter,
                                               status=Project.SALE_CLOSED)

        Share.objects.create(project=self.project1, patron=self.patron, quantity=10)
        Share.objects.create(project=self.project2, patron=self.patron, quantity=5)

    def test_list_all_projects(self):
        url = reverse('projects')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_filter_open_projects(self):
        url = reverse('projects') + '?open=true'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.project1.id)

    def test_filter_projects_by_artist(self):
        url = reverse('projects') + f'?artist={self.artist1.username}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertContains(response, self.project1.title)
        self.assertContains(response, self.project3.title)

    def test_filter_projects_by_patron(self):
        url = reverse('projects') + f'?patron={self.patron.username}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertContains(response, self.project1.title)
        self.assertContains(response, self.project2.title)

    def test_filter_projects_by_presenter(self):
        url = reverse('projects') + f'?presenter={self.presenter.username}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        self.assertContains(response, self.project1.title)
        self.assertContains(response, self.project2.title)
        self.assertContains(response, self.project3.title)


class TestProjectCreateView(APITestCase):
    def setUp(self):
        self.artist = User.objects.create_user(username='artist', password='password')
        self.gallery = User.objects.create_user(username='gallery', password='password')
        self.gallery_group = Group.objects.create(name='Gallery')
        self.gallery_group.user_set.add(self.gallery)
        self.token = Token.objects.create(user=self.artist)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

    def test_create_project_by_artist(self):
        url = reverse('create_project_artist')
        data = {'title': 'New Project', 'description': 'This is a new project'}
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Project.objects.count(), 1)
        self.assertEqual(Project.objects.first().artist, self.artist)

    def test_create_project_by_gallery(self):
        self.client.force_authenticate(user=self.gallery)
        url = reverse('create_project_gallery', kwargs={'artist_id': self.artist.id})
        data = {'title': 'New Project', 'description': 'This is a new project'}
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Project.objects.count(), 1)
        self.assertEqual(Project.objects.first().artist_id, self.artist.id)
        self.assertEqual(Project.objects.first().presenter, self.gallery)

    def test_create_project_by_unauthorized_user(self):
        self.client.force_authenticate(user=User.objects.create_user(username='unauthorized', password='password'))
        url = reverse('create_project_artist')
        data = {'title': 'New Project', 'description': 'This is a new project'}
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Project.objects.count(), 0)


class TestProjectUpdateView(APITestCase):
    def setUp(self):
        self.artist = User.objects.create_user(username='artist', password='password')
        self.presenter = User.objects.create_user(username='presenter', password='password')
        self.project = Project.objects.create(artist=self.artist, presenter=self.presenter)
        self.token = Token.objects.create(user=self.artist)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

    def test_post_update_by_artist(self):
        url = reverse('project_update', kwargs={'pk': self.project.id})
        data = {'update': 'New project update'}
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProjectUpdate.objects.count(), 1)

    def test_post_update_by_presenter(self):
        self.client.force_authenticate(user=self.presenter)
        url = reverse('project_update', kwargs={'pk': self.project.id})
        data = {'update': 'New project update'}
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProjectUpdate.objects.count(), 1)

    def test_post_update_by_unauthorized_user(self):
        self.client.force_authenticate(user=User.objects.create_user(username='unauthorized', password='password'))
        url = reverse('project_update', kwargs={'pk': self.project.id})
        data = {'update': 'New project update'}
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(ProjectUpdate.objects.count(), 0)

    def test_post_update_too_soon(self):
        self.project.last_update_time = timezone.now()
        self.project.save()
        url = reverse('project_update', kwargs={'pk': self.project.id})
        data = {'update': 'New project update'}
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ProjectUpdate.objects.count(), 0)


class BuySharesViewTestCase(TestCase):
    def setUp(self):
        self.project = Project.objects.create(
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
