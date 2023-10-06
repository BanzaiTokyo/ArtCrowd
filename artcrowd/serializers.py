import json
from datetime import datetime, timedelta, timezone
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from django.conf import settings
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


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ['username', 'avatar']


class ShareAsNestedObj(serializers.ModelSerializer):
    patron = UserSerializer(read_only=True)

    class Meta:
        model = models.Share
        fields = ['patron', 'quantity', 'purchased_on']


class ProjectUpdateSerializer(serializers.ModelSerializer):
    created_on = serializers.DateTimeField(read_only=True)

    class Meta:
        model = models.ProjectUpdate
        fields = ['description', 'image', 'created_on']

    def validate(self, data):
        if not data.get('description') and not data.get('image'):
            raise ValidationError("Either a description or an image must be provided.")
        return data


class ProjectSerializer(serializers.ModelSerializer):
    artist = UserSerializer(read_only=True)
    presenter = UserSerializer(read_only=True)
    last_update = ProjectUpdateSerializer(read_only=True)
    sorted_shares = ShareAsNestedObj(many=True, read_only=True)
    shares_num = serializers.IntegerField(read_only=True)
    shares_sum = serializers.DecimalField(decimal_places=6, max_digits=16, read_only=True)
    can_post_update = serializers.SerializerMethodField()
    can_buy_shares = serializers.SerializerMethodField()

    def get_can_post_update(self, obj):
        return self.context['request'].user.id and self.context['request'].user.id in (obj.artist_id, obj.presenter_id)

    def get_can_buy_shares(self, obj):
        return self.context['request'].user.id and obj.status not in (models.Project.NEW,models.Project.EXPIRED, models.Project.REJECTED, models.Project.CLOSED)

    class Meta:
        model = models.Project
        fields = ['id', 'title', 'description', 'image', 'created_on', 'deadline',
                  'share_price', 'min_shares', 'max_shares', 'shares_num', 'shares_sum', 'sorted_shares',
                  'royalty_pct', 'artist', 'presenter', 'last_update',
                  'can_post_update', 'can_buy_shares']


class ProjectListSerializer(serializers.Serializer):
    projects = ProjectSerializer(many=True)
    gallery_projects = ProjectSerializer(many=True)
    supported_projects = ProjectSerializer(many=True)


class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Project
        fields = ['id', 'title', 'description', 'image', 'deadline', 'share_price', 'min_shares', 'max_shares']

    deadline = serializers.DateTimeField(
        validators=[MinValueValidator(datetime.now(tz=timezone.utc) + timedelta(days=1))]
    )
    share_price = serializers.DecimalField(min_value=1, max_digits=18, decimal_places=0)
    min_shares = serializers.IntegerField(required=False, min_value=1)
    max_shares = serializers.IntegerField(required=False, min_value=1)

    def validate(self, data):
        min_shares = data.get('min_shares')
        max_shares = data.get('max_shares')

        if min_shares is not None and max_shares is not None:
            if max_shares < min_shares:
                raise serializers.ValidationError({"max_shares": ["Max shares must be greater than min shares"]})

        data['share_price'] = data['share_price']

        return data


class BuySharesSerializer(serializers.ModelSerializer):
    ophash = serializers.CharField(max_length=51, write_only=True)
    patron = UserSerializer(read_only=True)
    quantity = serializers.IntegerField(read_only=True)
    purchased_on = serializers.DateTimeField(read_only=True)

    class Meta:
        model = models.Share
        fields = ['patron', 'quantity', 'purchased_on', 'ophash']


class ProjectMetadataSerializer(serializers.Serializer):
    def to_representation(self, instance):
        image_url = instance.image.url
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
            "description": instance.description,
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
