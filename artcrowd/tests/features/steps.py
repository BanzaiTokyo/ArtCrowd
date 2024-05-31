from behave import given, when, then
from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from datetime import timedelta
from django.utils import timezone
import os
from artcrowd.models import Project, Share, ProjectUpdate
from artcrowd.serializers import ProjectUpdateSerializer

User = get_user_model()

def before_scenario(context, scenario):
    context.mock_blockchain = patch('blockchain')
    context.mock_blockchain.start()

def after_scenario(context, scenario):
    context.mock_blockchain.stop()


@given('I am an authenticated user')
def step_authenticated_user(context):
    user = User.objects.create_user(username='testuser', password='testpass')
    context.user = user
    context.client = APIClient()
    context.client.force_authenticate(user=user)

@given('I am an authenticated superuser')
def step_authenticated_superuser(context):
    user = User.objects.create_superuser(username='superuser', password='testpass', email='super@example.com')
    context.user = user
    context.client = APIClient()
    context.client.force_authenticate(user=user)

@given('I am the artist for a project')
def step_project_artist(context):
    project = Project.objects.create(artist=context.user, name='Test Project')
    context.project = project

@given('I am the presenter for a project')
def step_project_presenter(context):
    project = Project.objects.create(presenter=context.user, name='Test Project')
    context.project = project

@given('I am not the artist or presenter for a project')
def step_not_project_member(context):
    project = Project.objects.create(name='Test Project')
    context.project = project

@given('I posted an update less than {hours:d} hours ago')
def step_recent_update(context, hours):
    update = ProjectUpdate.objects.create(project=context.project, author=context.user, content='Recent update')
    context.project.last_update_time = timezone.now() - timedelta(hours=hours-1)
    context.project.save()

@when('I post a new update to the project')
def step_post_update(context):
    data = {'content': 'New update'}
    serializer = ProjectUpdateSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    url = f'/api/{context.project.pk}/'
    context.response = context.client.post(url, data, format='json')

@when('I post a new update to the project with a file attachment')
def step_post_update_with_file(context):
    data = {'content': 'New update with file'}
    file_path = os.path.join(os.path.dirname(__file__), 'test_file.jpg')
    with open(file_path, 'rb') as f:
        file_data = f.read()
    file = SimpleUploadedFile('test_file.txt', file_data, content_type='text/plain')
    data['file'] = file
    serializer = ProjectUpdateSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    url = f'/api/{context.project.pk}/'
    context.response = context.client.post(url, data, format='multipart')

@when('I try to post an update to the project')
def step_try_post_update(context):
    data = {'content': 'New update'}
    serializer = ProjectUpdateSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    url = f'/api/{context.project.pk}/'
    context.response = context.client.post(url, data, format='json')

@then('I should receive response code {status_code:d}')
def step_receive_error(context, status_code):
    assert context.response.status_code == status_code

@then('response contains "{expected_content}"')
def step_response_contains(context, expected_content):
    response_content = context.response.content.decode('utf-8')
    assert expected_content in response_content, f"Expected content '{expected_content}' not found in response"

@given('there is a project with {share_price:d} share price and {num_shares:d} available shares')
def step_project_with_shares(context, share_price, num_shares):
    project = Project.objects.create(name='Test Project', share_price=share_price, max_shares=num_shares)
    context.project = project

@given('I deposited {amount:d} money')
def step_deposit_money(context, amount):
    context.deposited_amount = amount

@given('I have already bought shares in this project')
def step_previous_shares(context):
    Share.objects.create(project=context.project, patron=context.user, quantity=10)
    context.previous_shares = True

@when('I buy {num_shares:d} shares')
def step_buy_shares(context, num_shares):
        context.mock_blockchain.get_wallet_money.return_value = context.deposited_amount
        context.mock_blockchain.get_bought_shares.return_value = num_shares
        url = f'/api/projects/{context.project.pk}/buy/'
        data = {'quantity': num_shares, 'wallet': 'test_wallet', 'ophash': 'test_ophash'}
        context.response = context.client.post(url, data, format='json')

@then('the shares should be allocated to me')
def step_shares_allocated(context):
    share = Share.objects.get(project=context.project, patron=context.user)
    assert share.quantity == context.response.data['quantity']

@then('the project\'s total shares should be updated')
def step_project_shares_updated(context):
    project = Project.objects.get(pk=context.project.pk)
    assert project.shares_num == context.response.data['quantity']

@then('my funds should be refunded')
def step_funds_refunded(context):
    context.mock_blockchain.refund.assert_called()

@then('a token should be generated for me')
def step_token_generated(context):
    context.mock_blockchain.generate_token.assert_called()

@then('the additional shares should be allocated to me')
def step_additional_shares_allocated(context):
    step_shares_allocated(context)

@then('the project status should be updated to "{status}"')
def step_project_status_updated(context, status):
    project = Project.objects.get(pk=context.project.pk)
    assert project.status == status
