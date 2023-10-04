from django.shortcuts import get_object_or_404, render, redirect, resolve_url
from django.contrib.auth.decorators import login_required, permission_required
from django.core.exceptions import PermissionDenied
from django.db.models import Count
from . import models, forms


@login_required
def profile(request):
    context = {
        'projects': models.Project.objects.filter(artist=request.user).all(),
        'gallery_projects': models.Project.objects.filter(presenter=request.user).all(),
        'supported_projects': models.Project.objects.filter(share__patron_id=request.user.id)
                                    .annotate(share_count=Count('share__id'))
    }
    return render(request, "profile.html", context)


@login_required
def project(request, project_id):
    project = get_object_or_404(models.Project, id=project_id)
    form = forms.ProjectUpdateForm()
    if request.method == 'POST':
        if request.user != project.artist and request.user != project.presenter:
            raise PermissionDenied('Only project artist or presenter can post updates')
        form = forms.ProjectUpdateForm(request.POST, request.FILES)
        if form.is_valid():
            project_update = form.save(commit=False)
            project_update.project = project
            project_update.author = request.user
            project_update.save()
            return redirect(request.META.get('HTTP_REFERER'))
    return render(request, "project.html", {'project': project, 'form': form})


@permission_required('can_create_project')
def create_project_artist(request, artist_id=None, template_name='project_create.html'):
    form = forms.ProjectCreateForm()
    if request.method == 'POST':
        form = forms.ProjectCreateForm(request.POST, request.FILES)
        if form.is_valid():
            project = form.save(commit=False)
            if artist_id:
                project.presenter = request.user
                project.artist_id = artist_id
            else:
                project.artist = request.user
            project.save(request.user)
            return redirect(resolve_url('project', project.id))
    context = {
        'form': form,
        'artist': get_object_or_404(models.User, id=artist_id) if artist_id else None
    }
    return render(request, template_name, context)


@permission_required('can_create_project')
def create_project_gallery(request, artist_id):
    return create_project_gallery(request, artist_id)


@login_required
def buy_shares(request, project_id):
    project = get_object_or_404(models.Project, id=project_id)
    form = forms.BuySharesForm(request.POST)
    if form.is_valid():
        shares = models.Share.objects.create(project=project, patron=request.user, quantity=form.cleaned_data['num_shares'])

    return redirect(resolve_url('project', project.id))
