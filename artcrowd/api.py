from django.shortcuts import get_object_or_404
from django.urls import path
from django.core.exceptions import PermissionDenied
from django.db.models import Count
from rest_framework import generics, permissions, serializers as drf_serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken import views as auth_views
from . import models, serializers, blockchain


class LoginByWalletView(auth_views.ObtainAuthToken):
    serializer_class = serializers.AuthTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'username': user.username, 'avatar': user.avatar.url if user.avatar else None})


class LogoutView(generics.views.APIView):
    def get(self, request):
        request.user.auth_token.delete()
        return Response()


class CheckinView(generics.views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response()


class ProfileView(generics.views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = {
            'projects': models.Project.objects.filter(artist=request.user).all(),
            'gallery_projects': models.Project.objects.filter(presenter=request.user).all(),
            'supported_projects': models.Project.objects.filter(shares__patron_id=request.user.id)
                                        .annotate(share_count=Count('shares__id'))
        }
        serializer = serializers.ProjectListSerializer(data, context={'request': request})
        return Response(serializer.data)


class ProjectDetail(generics.RetrieveAPIView):
    queryset = models.Project.objects.all()
    serializer_class = serializers.ProjectSerializer


class ProjectUpdate(generics.CreateAPIView):
    queryset = models.ProjectUpdate.objects.all()
    permission_classes = [permissions.DjangoModelPermissions]
    serializer_class = serializers.ProjectUpdateSerializer

    def perform_create(self, serializer):
        project_id = self.kwargs.get('pk')
        project = get_object_or_404(models.Project, pk=project_id)

        if self.request.user != project.artist and self.request.user != project.presenter:
            raise PermissionDenied('Only project artist or presenter can post updates')

        serializer.save(project=project, author=self.request.user)


class ProjectCreateView(generics.CreateAPIView):
    queryset = models.Project.objects.all()
    serializer_class = serializers.ProjectCreateSerializer
    permission_classes = [permissions.DjangoModelPermissions]

    def perform_create(self, serializer: drf_serializers.Serializer):
        artist_id = self.kwargs.get('artist_id')
        if artist_id:
            serializer.save(artist_id=artist_id, presenter=self.request.user)
        else:
            serializer.save(artist=self.request.user)


class ProjectMetadataView(generics.RetrieveAPIView):
    queryset = models.Project.objects.all()
    serializer_class = serializers.ProjectMetadataSerializer


class BuySharesView(generics.CreateAPIView):
    serializer_class = serializers.BuySharesSerializer
    queryset = models.Share.objects.all()

    def perform_create(self, serializer):
        project = get_object_or_404(models.Project, id=self.kwargs['pk'])
        ophash = serializer.validated_data['ophash']
        num_shares, wallet = blockchain.get_bought_shares(ophash)
        if not (share := models.Share.objects.filter(ophash=ophash).first()):
            share = models.Share.objects.create(project=project, patron=self.request.user, quantity=num_shares,
                                                ophash=serializer.validated_data['ophash'])
        serializer._validated_data = share


url_patterns = [
    path("login", auth_views.obtain_auth_token, name='login'),
    path("login-by-wallet", LoginByWalletView.as_view(), name='login_by_wallet'),
    path("logout", LogoutView.as_view(), name='logout'),
    path("checkin", CheckinView.as_view(), name='checkin'),
    path("profile", ProfileView.as_view(), name='profile'),
    path("<int:pk>", ProjectDetail.as_view(), name='project'),
    path("<int:pk>/update", ProjectUpdate.as_view(), name='project_update'),
    path("<int:pk>/buy", BuySharesView.as_view(), name='buy_shares'),
    path("<int:pk>/metadata", ProjectMetadataView.as_view(), name='project_metadata'),
    path("create", ProjectCreateView.as_view(), name='create_project_artist'),
    path("create/for/<int:artist_id>", ProjectCreateView.as_view(), name='create_project_gallery'),
]