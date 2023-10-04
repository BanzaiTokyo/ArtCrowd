from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import TemplateView
from . import views, api

urlpatterns = [
    path('accounts/', include('django.contrib.auth.urls')),
    path('netutseli/', admin.site.urls),
    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    path('profile', views.profile, name='profile'),
    path("<int:project_id>", views.project, name='project'),
    path("<int:project_id>/buy", views.buy_shares, name='buy_shares'),
    path('create', views.create_project_artist, name='create_project_artist'),
    path('create/for/<int:artist_id>', views.create_project_gallery, name='create_project_gallery'),

    path('api/', include(api.url_patterns))
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
