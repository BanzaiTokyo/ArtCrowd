import os
import json
from datetime import timedelta
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.conf import settings
from sorl_thumbnail_serializer.fields import HyperlinkedSorlImageField
from . import models


class ACAuthTokenSerializer(serializers.Serializer):
    wallet = serializers.CharField(write_only=True)
    signature = serializers.CharField(write_only=True)
    message = serializers.CharField(write_only=True)
    token = serializers.CharField(read_only=True)
    username = serializers.CharField(read_only=True)
    avatar = serializers.ImageField(read_only=True)

    def validate(self, attrs):
        user = authenticate(request=self.context.get('request'),
                            username=attrs['wallet'], password=attrs['signature'], message=attrs['message'])
        if not user:
            msg = _('Unable to log in with provided credentials.')
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs


class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ['username', 'avatar']


class UserSerializer(serializers.ModelSerializer):
    created_projects_num = serializers.SerializerMethodField()
    supported_projects_num = serializers.SerializerMethodField()
    presented_projects_num = serializers.SerializerMethodField()

    def get_created_projects_num(self, obj):
        return models.Project.objects.filter(artist=obj).count()

    def get_supported_projects_num(self, obj):
        return models.Share.objects.filter(patron=obj).values('project_id').distinct().count()

    def get_presented_projects_num(self, obj):
        return models.Project.objects.filter(presenter=obj).count()

    class Meta:
        model = models.User
        fields = ['username', 'avatar', 'cover_picture', 'description', 'created_projects_num',
                  'supported_projects_num', 'presented_projects_num']


class ShareAsNestedObj(serializers.ModelSerializer):
    patron = UserBriefSerializer(read_only=True)

    class Meta:
        model = models.Share
        fields = ['patron', 'quantity', 'purchased_on']


class ProjectUpdateSerializer(serializers.ModelSerializer):
    created_on = serializers.DateTimeField(read_only=True)

    class Meta:
        model = models.ProjectUpdate
        fields = ['id', 'description', 'image', 'created_on']

    def validate(self, data):
        if not data.get('description') and not data.get('image'):
            raise ValidationError("Either a description or an image must be provided.")
        return data


class ProjectBriefSerializer(serializers.ModelSerializer):
    artist = UserBriefSerializer(read_only=True)
    presenter = UserBriefSerializer(read_only=True)
    image = HyperlinkedSorlImageField('100', read_only=True)
    last_update = ProjectUpdateSerializer(read_only=True)
    shares_num = serializers.IntegerField(read_only=True)
    can_buy_shares = serializers.SerializerMethodField()

    def get_can_buy_shares(self, obj):
        return obj.status == models.Project.OPEN and (
                    not obj.max_shares or obj.shares_num < obj.max_shares
                )

    class Meta:
        model = models.Project
        fields = ['id', 'title', 'description', 'image', 'created_on', 'deadline',
                  'share_price', 'min_shares', 'max_shares', 'shares_num',
                  'royalty_pct', 'artist', 'presenter', 'last_update', 'status', 'can_buy_shares'
                  ]


class ProjectSerializer(ProjectBriefSerializer):
    image = serializers.ImageField(read_only=True)
    shares = ShareAsNestedObj(many=True, read_only=True)
    updates = ProjectUpdateSerializer(many=True, read_only=True)
    can_post_update = serializers.SerializerMethodField()

    def get_can_post_update(self, obj):
        return self.context['request'].user.id and (
                    self.context['request'].user.id in (obj.artist_id, obj.presenter_id)
                    or self.context['request'].user.is_superuser
                ) and ((timezone.now() - obj.last_update_time).total_seconds() > settings.UPDATE_POST_INTERVAL)

    class Meta:
        model = models.Project
        fields = ProjectBriefSerializer.Meta.fields + [
                    'updates', 'shares_sum', 'shares', 'nft_description', 'can_post_update']


class ProjectListSerializer(serializers.Serializer):
    projects = ProjectBriefSerializer(many=True)
    gallery_projects = ProjectBriefSerializer(many=True)
    supported_projects = ProjectBriefSerializer(many=True)


class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Project
        fields = ['id', 'title', 'description', 'image', 'deadline', 'share_price', 'min_shares', 'max_shares',
                  'nft_description', 'royalty_pct']

    title = serializers.CharField(min_length=5, max_length=100)
    deadline = serializers.DateTimeField(
        validators=[MinValueValidator(timezone.now() + timedelta(days=1))]
    )
    share_price = serializers.IntegerField(min_value=1)
    min_shares = serializers.IntegerField(required=False, min_value=1)
    max_shares = serializers.IntegerField(required=False, min_value=1, max_value=1000)
    royalty_pct = serializers.IntegerField(min_value=0, max_value=15)

    def validate(self, data):
        min_shares = data.get('min_shares')
        max_shares = data.get('max_shares')

        if min_shares is not None and max_shares is not None:
            if max_shares < min_shares:
                raise serializers.ValidationError({"max_shares": ["Max shares must be greater than min shares"]})

        return data


class BuySharesSerializer(serializers.ModelSerializer):
    ophash = serializers.CharField(max_length=51, write_only=True)
    blockhash = serializers.CharField(max_length=51, write_only=True)
    patron = UserBriefSerializer(read_only=True)
    quantity = serializers.IntegerField(read_only=True)
    purchased_on = serializers.DateTimeField(read_only=True)

    class Meta:
        model = models.Share
        fields = ['patron', 'quantity', 'purchased_on', 'ophash', 'blockhash']


class ProjectMetadataSerializer(serializers.Serializer):
    def to_representation(self, instance):
        image_url = os.path.join(settings.ROOT_URL,  instance.image.url)
        image_ext = str(instance.image).split('.')[-1]
        with open(settings.TEZOS_WALLET_KEYFILE, 'rt') as fp:
            keyfile = json.load(fp)

        metadata = {
            "artifactUri": image_url,
            "attributes": [],
            "creators": [
                instance.artist.tzwallet
            ],
            "date": instance.created_on.isoformat() + 'Z',
            "description": instance.nft_description,
            "decimals": 0,
            "minter": keyfile['pkh'],
            "image": image_url,
            "name": instance.title,
            "formats": [
                {
                    "dimensions": {
                        "unit": "px",
                        "value": f"{instance.image.width}x{instance.image.height}"
                    },
                    "fileName": f"artcrowd_{instance.id}." + image_ext,
                    "fileSize": instance.image.size,
                    "mimeType": "image/" + image_ext,
                    "uri": image_url
                }
            ],
            "rights": "No License / All Rights Reserved",
            "thumbnailUri": image_url
        }
        if instance.royalty_pct:
            metadata["royalties"] = {
                "decimals": 3,
                "shares": {
                    instance.artist.tzwallet: int(instance.royalty_pct * 10)
                }
            }
        return metadata
