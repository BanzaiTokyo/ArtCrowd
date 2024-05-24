from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.db.models.expressions import RawSQL
from django.urls import reverse
from django.utils.safestring import mark_safe
from sorl.thumbnail import get_thumbnail
from . import models, blockchain


@admin.register(models.User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'tzwallet')
    #list_filter = ('is_staff', 'is_superuser', 'groups')
    search_fields = ('username', 'tzwallet')
    readonly_fields = ('avatar_tag', 'cover_picture_tag')
    ordering = ('username',)
    fieldsets = (
        (None, {'fields': ('username', )}),
        ('Personal info', {'fields': ('tzwallet', 'description', 'email', 'avatar', 'avatar_tag',
                                      'cover_picture', 'cover_picture_tag')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    @admin.display(description='Avatar')
    def avatar_tag(self, obj):
        return mark_safe('<img src="{}" height="50"/>'.format(obj.avatar.url)) if obj.avatar.url else ''

    @admin.display(description='Cover Picture')
    def cover_picture_tag(self, obj):
        return mark_safe('<img src="{}" height="200"/>'.format(obj.cover_picture.url)) if obj.cover_picture.url else ''

    def get_fields(self, request, obj=None):
        fields = super().get_fields(request, obj)
        fields.insert(fields.index('avatar')+1, 'avatar_tag')
        fields.insert(fields.index('cover_picture')+1, 'cover_picture_tag')
        return fields


class ProjectUpdate(admin.StackedInline):
    extra = 0
    model = models.ProjectUpdate
    readonly_fields = ('preview', 'created_on')
    ordering = ("-created_on", )

    def preview(self, obj):
        return mark_safe(f'<img src="{obj.image.url}" style="max-width: 200px; max-height: 200px" />')


class ShareInline(admin.TabularInline):
    extra = 0
    model = models.Share
    readonly_fields = ['project', 'patron', 'quantity', 'purchased_on', 'ophash']
    ordering = ("-purchased_on", )

    def has_add_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(models.Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist', 'created_on', 'status')
    list_filter = ('status', )
    search_fields = ('title', 'artist__username')
    inlines = [ProjectUpdate, ShareInline]
    list_per_page = 20

    def get_readonly_fields(self, request, obj=None):
        self.request = request
        result = ['preview']
        if obj and obj.status != models.Project.NEW:
            result.append('share_price')
        return result

    def preview(self, obj):
        thumbnail = get_thumbnail(obj.image, '100')
        url = self.request.build_absolute_uri(thumbnail.url)
        return mark_safe(f'<img src="{url}" />')

    def get_fields(self, request, obj=None):
        fields = super().get_fields(request, obj)
        fields.remove('preview')
        image_pos = fields.index('image')
        fields.insert(image_pos+1, 'preview')
        return fields

    def save_model(self, request, obj, form, change):
        from django.db.models.expressions import RawSQL
        from .models import Project, Share
        from django.utils import timezone
        projects = Project.objects.filter(pk__in=RawSQL(f'''
            SELECT id FROM {Project.objects.model._meta.db_table} 
            WHERE status=%s AND (deadline < %s OR max_shares > 0
                AND (SELECT sum(quantity) FROM artcrowd_share
                WHERE project_id=artcrowd_project.id) >= max_shares)
        ''', (Project.OPEN, timezone.now()))).all()
        obj.save()
        #return blockchain.buy_shares(obj, 3)
        if form.initial.get('status') != form.cleaned_data['status']:
            if form.cleaned_data['status'] == models.Project.REFUNDED:
                blockchain.refund(obj)
                obj.project_shares.all().delete()
            elif form.cleaned_data['status'] == models.Project.COMPLETED:
                blockchain.update_project_status(obj)
                meta_url = reverse('project_metadata', args=(obj.id,))
                meta_url = request.build_absolute_uri(meta_url)
                blockchain.generate_tokens(obj, meta_url)
            elif form.cleaned_data['status'] == models.Project.OPEN:
                blockchain.create_project(obj)
            elif form.cleaned_data['status'] == models.Project.SALE_CLOSED:
                blockchain.update_project_status(obj)
