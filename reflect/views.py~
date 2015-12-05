from django.shortcuts import render

from .models import Post, Category, Thread, Forum, Settings, Cursor, Response, Threaddata, Feature, Forumdata, Session

from .serializers import PostSerializer, ThreadSerializer,CursorSerializer,ResponseSerializer,ThreaddataSerializer, SettingsSerializer, ForumSerializer, FeatureSerializer, SessionSerializer, ForumdataSerializer

from rest_framework import viewsets

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

class ThreadViewSet(viewsets.ModelViewSet):
    queryset = Thread.objects.all()
    serializer_class = ThreadSerializer

class CursorViewSet(viewsets.ModelViewSet):
    queryset = Cursor.objects.all()
    serializer_class = CursorSerializer

class ResponseViewSet(viewsets.ModelViewSet):
    queryset = Response.objects.all()
    serializer_class = ResponseSerializer

class ThreaddataViewSet(viewsets.ModelViewSet):
    queryset = Threaddata.objects.all()
    serializer_class = ThreaddataSerializer

class SettingsViewSet(viewsets.ModelViewSet):
    queryset = Settings.objects.all()
    serializer_class = SettingsSerializer

class ForumViewSet(viewsets.ModelViewSet):
    queryset = Forum.objects.all()
    serializer_class = ForumSerializer

class FeatureViewSet(viewsets.ModelViewSet):
    queryset = Feature.objects.all()
    serializer_class = FeatureSerializer

class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

class ForumdataViewSet(viewsets.ModelViewSet):
    queryset = Forumdata.objects.all()
    serializer_class = ForumdataSerializer
