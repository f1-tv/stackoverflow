
from django.contrib.auth.models import User

from rest_framework import serializers, viewsets, routers, authentication

from .models import Category, Forum, Post, Thread, Settings, Threaddata, Cursor, Response, Feature, Forumdata, Session


from django.contrib.contenttypes.models import ContentType
from django.utils.translation import get_language
from django.utils.translation import gettext as _
from django.core.urlresolvers import reverse



class PostSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = Post
        fields = ('isHighlighted','isFlagged', 'forum', 'parent', 'author', 'media', 'points', 'isApproved', 'dislikes', 'raw_message', 'isSpam', 'thread', 'depth', 'numReports', 'isDeletedByAuthor',  'createdAt', 'isEdited', 'message', 'id', 'isDeleted', 'likes')


class ThreadSerializer(serializers.ModelSerializer):
    
     
    class Meta:
        model = Thread
        
        field = ('feed', 'uploadAdd', 'author','dislikes', 'likes', 'message', 'id', 'createdAt', 'category', 'clean_title', 'userScore', 'moderators', 'isSpam', 'signedLink', 'isDeleted', 'hasStreaming', 'uploadRemove', 'raw_message', 'isClosed', 'link', 'slug', 'forum', 'identifiers', 'posts', 'userSubscription', 'title', 'highlighedPost' )

class CursorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cursor
        fields = ('hasPrev', 'total', 'prev', 'hasNext', 'next')


class ResponseSerializer(serializers.ModelSerializer):
    posts = PostSerializer()
    thread = ThreadSerializer()
    class Meta:
        model = Response
        fields = ('lastModified', 'posts', 'thread')


class ThreaddataSerializer(serializers.ModelSerializer):
    cursor = CursorSerializer()
    response = ResponseSerializer()
    class Meta:
        model = Threaddata
        field = ('cursor', 'code', 'response', 'order')


class SettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settings
        field = ('supportLevel', 'adsDRNativeEnabled', 'disable3rdPartyTrackers', 'moderatorText','ssoRequired','linkAffiliationEnabled','hasCustomAvatar', 'organicDiscoveryEnabled', 'colorScheme', 'discoveryMax', 'discoverySettingsUrl', 'adsVideoEnabled', 'allowAnonPost', 'allowMedia', 'promotedDiscoveryEnabled', 'allowAnonVotes', 'mustVerify', 'mustVerifyEmail', 'discoveryVariant','adsBannerEnabled', 'audienceSyncEnabled', 'typeface', 'discoveryLocked', 'discoveryThumbnailsEnabled' , 'isVIP' )



class ForumSerializer(serializers.ModelSerializer):
    settings = SettingsSerializer()
    class Meta:
        model = Forum
        field = ('category', 'description' ,'founder', 'settings', 'url' ,'guidelines', 'favicon' ,'language', 'avatar', 'pk', 'signedUrl' ,'raw_guidelines', 'id' ,'channel', 'name')


class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        field = ('sso')

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        field = ('canModerate','audienceSyncVerified', 'mustVerify', 'canReply', 'mustVerifyEmail')





class ForumdataSerializer(serializers.ModelSerializer):
    session = SessionSerializer()
    features = FeatureSerializer()
    forum = ForumSerializer()
    class Meta:
        model = Forumdata
        field = ('session', 'features', 'forum')





























