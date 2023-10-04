from django.contrib import admin
from django.urls import reverse
from . import models, blockchain


admin.site.register(models.User)
@admin.register(models.Project)
class ProjectAdmin(admin.ModelAdmin):
    def get_readonly_fields(self, request, obj=None):
        if obj and obj.status != models.Project.NEW:
            return ['share_price']
        return []

    def save_model(self, request, obj, form, change):
        obj.save(current_user=request.user)
        #return blockchain.buy_shares(obj, 3)
        if form.initial.get('status') != form.cleaned_data['status']:
            if form.cleaned_data['status'] == models.Project.REJECTED:
                blockchain.refund(obj)
            if form.cleaned_data['status'] == models.Project.CLOSED:
                #blockchain.update_project_status(obj)
                meta_url = reverse('project_metadata', args=(obj.id,))
                meta_url = request.build_absolute_uri(meta_url)
                blockchain.generate_tokens(obj, meta_url)
            else:
                blockchain.update_project_status(obj)
