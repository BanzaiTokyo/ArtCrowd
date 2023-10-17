from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.urls import reverse
from django.utils.safestring import mark_safe
from sorl.thumbnail import get_thumbnail
from . import models, blockchain


@admin.register(models.User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'tzwallet')
    #list_filter = ('is_staff', 'is_superuser', 'groups')
    search_fields = ('username', 'tzwallet')
    ordering = ('username',)

    fieldsets = (
        (None, {'fields': ('username', )}),
        ('Personal info', {'fields': ('tzwallet', 'first_name', 'description', 'email', 'avatar')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )


@admin.register(models.Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist', 'created_on', 'status')
    list_filter = ('status', )
    search_fields = ('title', 'artist__username')

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
        obj.save()
        #return blockchain.buy_shares(obj, 3)
        if form.initial.get('status') != form.cleaned_data['status']:
            if form.cleaned_data['status'] == models.Project.REFUNDED:
                blockchain.refund(obj)
            elif form.cleaned_data['status'] == models.Project.COMPLETED:
                #blockchain.update_project_status(obj)
                meta_url = reverse('project_metadata', args=(obj.id,))
                meta_url = request.build_absolute_uri(meta_url)
                blockchain.generate_tokens(obj, meta_url)
            elif form.cleaned_data['status'] == models.Project.OPEN:
                blockchain.create_project(obj)
