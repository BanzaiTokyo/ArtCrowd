from django.contrib.auth.models import AbstractUser, Group
from django.utils.functional import cached_property
from django.db import models
from sorl.thumbnail import ImageField
from ckeditor.fields import RichTextField
from . import settings


class User(AbstractUser):
    tzwallet = models.CharField(max_length=36, null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    cover_picture = models.ImageField(upload_to='cover_pictures/', null=True, blank=True)
    description = RichTextField(blank=True)

    @classmethod
    def get_or_create_from_wallet(cls, tzwallet):
        user = User.objects.filter(tzwallet=tzwallet).first()
        if not user:
            user = User(username=tzwallet, tzwallet=tzwallet)
            artists = Group.objects.get(name='Artist')
            user.save()
            user.groups.add(artists)
            user.save()
        return user


class Project(models.Model):
    NEW = 'new'
    APPROVED_BY_ARTIST = 'approved by artist'
    OPEN = 'open'
    REJECTED_BY_ARTIST = 'rejected by artist'
    REJECTED_BY_ADMIN = 'rejected by admin'
    REFUND_REQUESTED = 'refund requested'
    SALE_CLOSED = 'sale closed'
    COMPLETED = 'completed'
    REFUNDED = 'refunded'
    title = models.CharField(max_length=1024)
    description = models.TextField()
    image = ImageField(upload_to='projects/')
    artist = models.ForeignKey(settings.AUTH_USER_MODEL, models.SET_NULL, null=True, related_name='artist')
    presenter = models.ForeignKey(settings.AUTH_USER_MODEL, models.SET_NULL, null=True, blank=True, related_name='presenter')
    created_on = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField()
    status = models.CharField(max_length=50, default=NEW, choices=(
        (NEW, NEW), (APPROVED_BY_ARTIST, APPROVED_BY_ARTIST),
        (REJECTED_BY_ARTIST, REJECTED_BY_ARTIST), (REJECTED_BY_ADMIN, REJECTED_BY_ADMIN),
        (OPEN, OPEN), (REFUND_REQUESTED, REFUND_REQUESTED), (SALE_CLOSED, SALE_CLOSED),
        (COMPLETED, COMPLETED), (REFUNDED, REFUNDED)
    ))

    share_price = models.IntegerField()
    min_shares = models.IntegerField(null=True, blank=True)
    max_shares = models.IntegerField(null=True, blank=True)
    royalty_pct = models.IntegerField(blank=True, default=0)
    ntf_description = models.TextField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.old_status = self.status

    @cached_property
    def last_update(self):
        try:
            return self.project_updates.latest('created_on')
        except ProjectUpdate.DoesNotExist:
            return None

    @cached_property
    def last_update_time(self):
        return self.last_update.created_on if self.last_update else self.created_on

    @cached_property
    def updates(self):
        return list(self.project_updates.all().order_by('-created_on'))

    @cached_property
    def shares(self):
        return list(self.project_shares.all().order_by('-purchased_on'))

    @cached_property
    def shares_num(self):
        total_quantity = self.project_shares.aggregate(total_quantity=models.Sum('quantity'))['total_quantity']
        return total_quantity or 0  #self.project_shares.count()

    @cached_property
    def shares_sum(self):
        return self.shares_num * self.share_price


class ProjectStatus(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="project_statuses")
    status = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    updated_on = models.DateTimeField(auto_now_add=True)


class ProjectUpdate(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="project_updates")
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    description = models.TextField(null=True, blank=True)
    image = models.ImageField(null=True, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)


class Share(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="project_shares")
    patron = models.ForeignKey(settings.AUTH_USER_MODEL, models.SET_NULL, null=True)
    quantity = models.IntegerField()
    purchased_on = models.DateTimeField(auto_now_add=True)
    ophash = models.CharField(max_length=51)
