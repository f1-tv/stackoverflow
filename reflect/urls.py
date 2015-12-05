from django.conf.urls import include, url
from django.contrib.auth.decorators import login_required

from .views import PostViewSet, ThreadViewSet, CursorViewSet, ResponseViewSet, ThreaddataViewSet, SettingsViewSet, ForumViewSet, FeatureViewSet, SessionViewSet, ForumdataViewSet

from reflect import views

from rest_framework.urlpatterns import format_suffix_patterns

from rest_framework.routers import DefaultRouter

# router
router = DefaultRouter()
#router.register(r'comments', views.CommentList, 'list')
#router.register(r'forum', ForumViewSet)
#router.register(r'users', views.UserViewSet)

router.register(r'comments', PostViewSet)
router.register(r'thread', ThreadViewSet)
router.register(r'cursor', CursorViewSet)
router.register(r'response', ResponseViewSet)
router.register(r'threaddata', ThreaddataViewSet)
router.register(r'settings', SettingsViewSet)
router.register(r'forum', ForumViewSet)
router.register(r'feature', FeatureViewSet)

router.register(r'session', SessionViewSet)

router.register(r'forumdata', ForumdataViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^api/', include('rest_framework.urls', namespace='rest_framework')),
]
