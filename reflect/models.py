import os

from django.conf import settings
from django.contrib.auth.models import User, Permission
from django.db import models
from django.shortcuts import get_object_or_404
from django.template import defaultfilters
from django.utils.encoding import python_2_unicode_compatible
from django.utils.crypto import get_random_string
from django.utils.translation import ugettext_lazy as _

TONE_CHOICES = (
    ( 'Neutral', _('Neutral')),
    ( 'Amused', _('Amused')),
    ( 'Critical', _('Critical')),
    ( 'Complex', _('Complex')),
    ( 'Ironic', _('Ironic')),
)

LANGUAGE_CODES = (
        ('en', 'English'),
        ('te','Telugu'),
        ('AS', 'Assamese'),
        ('HI', 'Hindi'),
        ('kok', 'Konkani'),
        ('GU', 'Gujarati'),
        ('UR', 'Urdu'),
        ('kn', 'Kannada'),
        ('mal', 'Malayalam'),
        ('mr', 'Marathi'),
        ('mni', 'Manipuri'),
        ('OR', 'Oriya'),
        ('PA', 'Punjabi'),
        ('ne', 'Nepali'),
        ('ta', 'Tamil'),
        ('BN', 'Bengali'),       
    )


COMMENT_MAX_LENGTH = getattr(settings, 'COMMENT_MAX_LENGTH', 3000)


PATH_SEPARATOR = getattr(settings, 'COMMENT_PATH_SEPARATOR', '/')
PATH_DIGITS = getattr(settings, 'COMMENT_PATH_DIGITS', 10)

# no change in category
@python_2_unicode_compatible
class Category(models.Model):

    isDefault = models.BooleanField(default=1)
    title = models.CharField(max_length=80)
    order = models.IntegerField(blank=True, default=0)
    forum = models.CharField(default='general', max_length=80)
    

    class Meta(object):
        ordering = ['order']
        verbose_name = _('Category')
        verbose_name_plural = _('Categories')

    def __str__(self):
        return self.title

@python_2_unicode_compatible
class Settings(models.Model):
    title = models.CharField(max_length=80)
    supportLevel = models.IntegerField(blank=True, default=0)
    adsDRNativeEnabled =  models.BooleanField(default=0)
    adsBannerEnabled = models.BooleanField(default=0)
    disable3rdPartyTrackers =  models.BooleanField(default=0)
    adsVideoEnabled = models.BooleanField(default=0)
    allowMedia = models.BooleanField(default=0)
    allowAnonPost= models.BooleanField(default=0)
    allowAnonVotes= models.BooleanField(default=0)
    ssoRequired= models.BooleanField(default=0)
    mustVerify= models.BooleanField(default=0)
    discoveryLocked= models.BooleanField(default=0)
    audienceSyncEnabled= models.BooleanField(default=0)
    hasCustomAvatar= models.BooleanField(default=0)
    isVIP= models.BooleanField(default=0)
    mustVerifyEmail= models.BooleanField(default=0)

    moderatorText = models.CharField(max_length=200, null=True, blank=True)
    linkAffiliationEnabled = models.BooleanField(default=0)
    organicDiscoveryEnabled = models.BooleanField(default=0)
    colorScheme = models.CharField(max_length=20,default='auto')
    discoveryMax = models.BooleanField(default=0)
    discoverySettingsUrl = models.CharField(max_length=200, null=True, blank=True)
    promotedDiscoveryEnabled = models.BooleanField(default=0)
    discoveryVariant = models.CharField(max_length=20,default='default')
    typeface = models.CharField(max_length=20,default='auto')


    



    def __str__(self):
        return self.title




@python_2_unicode_compatible
class Forum(models.Model):
#from forum
 # To Do List
    """
    default moderator to founder
    Add permissions to founder
    add for multiple sub-domains/trusted domains, changing url field 
   
add settings 
change field for favicon to object
    """
    
    
    # moderators to add more mods.Double-check the related name 
    
    # not hard settings = someclass(); in that class add these below fields
    # some settings fields object
    # p3, add later
    # supportLevel = models.IntegerField(_('Support Level'), max_length=2,  default=0)
    # "adsDRNativeEnabled":false,
    #  "adsBannerEnabled":false,
    #  "disable3rdPartyTrackers":false,
    #  "adsVideoEnabled":false,
     # "allowMedia":false,
     # "allowAnonPost":false,
     # "allowAnonVotes":false,
     # "ssoRequired":false,
     # "mustVerify":true,
     # "discoveryLocked":false,
     # "audienceSyncEnabled":false,
     # "hasCustomAvatar":false,
     # "isVIP":false,
     # "mustVerifyEmail":true
    
    #other fields required
    
    #parent = models.ForeignKey(
    #    'self', related_name='child_forums', verbose_name=_('Parent forum'),
    #    blank=True, null=True
    #)
    
    
    
#end forum
    
    #position = models.IntegerField(_('Position'), blank=True, default=0)


# required fields in order


    name = models.CharField(_('Name'), max_length=80, unique=True)
    founder = models.ForeignKey(User, related_name = _('founder'),verbose_name=_('Founder'))
    settings = models.ForeignKey(Settings, related_name = _('settings'),verbose_name=_('settings'))
    url = models.URLField(_('Website URL'), max_length=300, blank=True)
         # unique is not set true as 3rd party js will verify source. Thumps Up!

    favicon = models.URLField("Favicon URL", max_length=300, blank=True)
    language = models.CharField(max_length=3, choices=LANGUAGE_CODES, default = 'en')
    
    category = models.ForeignKey(Category, related_name='forum_category')   
    


    
    description = models.TextField(_('Description'), blank=True)

    moderators = models.ForeignKey(
        User, blank=True, null=True,
        verbose_name=_('Moderators')
    )

    guidelines = models.CharField(max_length=200, null=True, blank=True)

    favicon = models.CharField(max_length=200, null=True, blank=True)

    avatar = models.CharField(max_length=200, null=True, blank=True)

    signedUrl = models.CharField(max_length=200, null=True, blank=True)

    raw_guidelines = models.CharField(max_length=200, null=True, blank=True)

    channel = models.CharField(max_length=200, null=True, blank=True)

    
    

    createdAt = models.DateTimeField(_('Date'), blank=True, null=True)
    
    
    

    class Meta(object):
        ordering = ['category']
        verbose_name = _('Forum')
        verbose_name_plural = _('Forums')

    def __init__(self, *args, **kwargs):
        super(Forum, self).__init__(*args, **kwargs)
        self.old_moderators = self.moderators

    def __str__(self):
        return self.name

    # Return forums that moderating one moderator
    def tot_forums_moderators(self, moderator):
        tot = self.__class__.objects.filter(
            moderators=moderator
        ).count()

        return tot

    def delete(self, *args, **kwargs):
        if not self.moderators.is_superuser:
            if self.moderators:
                # Only remove permissions if is moderator one forum
                tot_forum_moderator = self.tot_forums_moderators(self.moderators)
                if tot_forum_moderator <= 1:
                    # Remove permissions to user
                    try:
                        u = User.objects.get(username=self.moderators)
                        u.user_permissions.clear()
                    except Exception:
                        pass
        super(Forum, self).delete()

    def save(self, *args, **kwargs):
        try:
            if not self.moderators.is_superuser:
                # Remove last moderator
                if self.old_moderators:

                    # Only remove permissions if is moderator one forum
                    tot_forum_moderator = self.tot_forums_moderators(self.old_moderators)
                    if tot_forum_moderator <= 1:
                        u = User.objects.get(username=self.old_moderators)
                        u.user_permissions.clear()

                # Add permissions to user
                u = User.objects.get(username=self.moderators)

                permission1 = Permission.objects.get(codename='add_topic')
                permission2 = Permission.objects.get(codename='change_topic')
                permission3 = Permission.objects.get(codename='delete_topic')

                u.user_permissions.add(permission1)
                u.user_permissions.add(permission2)
                u.user_permissions.add(permission3)
        except Exception:
            pass

        super(Forum, self).save(*args, **kwargs)

    def clean(self):
        if self.name:
            self.name = self.name.strip()

    def escape_html_description(obj):
        return obj.description
    escape_html_description.allow_tags = True


def generate_path(instance, filename):

    folder = ""
    folder = "forum_" + str(instance.forum_id)
    folder = folder + "_user_" + str(instance.user)
    folder = folder + "_topic_" + str(instance.id_attachment)
    return os.path.join("forum", folder, filename)















@python_2_unicode_compatible
class Thread(models.Model):
# from topic
# requests are coming from the javascript ; just need to save them to the models
    # and serve the content for the respective urls
    
    #change category to foreign key later
    
    url = models.URLField(_('URL'), max_length=500, unique=True)    
    
       
    documentTitle = models.CharField(_('Document Title'), max_length=80) 
    category = models.ForeignKey(
        Category, related_name='thread_forums',
        verbose_name=_('Category')
    )
    
    # change the sortOrder
    sortOrder = models.IntegerField()
    language = models.CharField(max_length=3, choices=LANGUAGE_CODES, default = 'en') 

     
    
    
    # other meta
    """
    Topic === Thread
    moderate === canModerates
    user === author
    date === createdAt 
    
    """
    
    
    # To Do List
    """
    def for feed to get automatically add url
    rating system no dislikes
    rating system no userScore ; userScore is recommend button
    posts is total number of comments
    
    

add identifiers array field
    """
    
    
    #p3
    #reactions = models.IntegerField(default=0)
    # other fields required
    # Need to work on how description is saved . My strong guess embed.ly
    # For now as the js is not sending this data, commenting out
# end topic
# important - user is changed to author- verify in comments as well
# all required fields in order
    feed = models.CharField(max_length=255, null=True, blank=True)

    uploadAdd =  models.CharField(max_length=255, null=True, blank=True)

    author = models.ForeignKey(
        User, related_name='Thread_author', verbose_name=_('User'))

    dislikes = models.IntegerField(default=0)

    likes = models.IntegerField(default=0)

    message = models.CharField(_('Message to users'), max_length=100, blank=True, null=True)



    canModerate = models.BooleanField(_('Moderate'), default=False)

    canPost = models.BooleanField(default=False)
    
    #id

    createdAt = models.DateTimeField(_('Date'), blank=False, db_index=False)

    category = models.IntegerField(default=0)

    clean_title = models.CharField(max_length=255, null=True, blank=True)

    userScore = models. IntegerField(default=0)


# for multiple mods, for now only one mod allowed
    moderators = models.ForeignKey(
        User, related_name='Thread_', verbose_name=_('User'))


    isSpam = models.BooleanField(default=False)

    signedLink = models.CharField(max_length=255, null=True, blank=True)

    isDeleted = models.BooleanField(_('Delete Thread'), default=False)

    hasStreaming = models.BooleanField(default=False)

    uploadRemove = models.CharField(max_length=255, null=True, blank=True)

    raw_message = models.CharField(max_length=255, null=True, blank=True)

    isClosed = models.BooleanField(default=False)

    link = models.CharField(_('Link'), max_length=200, unique=True)

    slug = models.SlugField(max_length=100)

    forum = models.ForeignKey(Forum, related_name='thread_foru', verbose_name=_('Forum'))
    
    identifiers = models.CharField(max_length=500)

    posts = models.IntegerField(default=0)

    userSubscription = models.BooleanField(default=False)

    title = models.CharField(_('Title'), max_length=80)

    highlightedPost = models.BooleanField(default=False)

    id_attachment = models.CharField(max_length=200, null=True, blank=True)
    
    id = models.AutoField(primary_key=True)
    
    reactions = models.IntegerField(default=0)

    class Meta(object):
        ordering = ['forum', 'createdAt', 'title']
        verbose_name = _('Thread')
        verbose_name_plural = _('Threads')

    def __str__(self):
        return self.title

    def delete(self, *args, **kwargs):
        idtopic = self.idtopic
        forum = self.forum_id

        thread = get_object_or_404(Thread, id=id)

        folder = ""
        folder = "forum_" + str(forum)
        folder = folder + "_user_" + str(thread.user.username)
        folder = folder + "_topic_" + str(thread.id_attachment)
        path_folder = os.path.join("forum", folder)
        media_path = settings.MEDIA_ROOT
        path = media_path + "/" + path_folder

        # Remove attachment if exists
        from .utils import remove_folder, exists_folder
        if exists_folder(path):
            remove_folder(path)

        Thread.objects.filter(id=id).delete()
        self.update_forum_threads(self.forum, "subtraction")

    def save(self, *args, **kwargs):

        if not self.id:
            self.slug = defaultfilters.slugify(self.title)
            self.update_forum_threads(self.forum, "sum")

        self.generate_id_attachment(self.id_attachment)
        super(Thread, self).save(*args, **kwargs)

    def update_forum_threads(self, forum, action):

        f = Forum.objects.get(name=forum)
        

        
    def generate_id_attachment(self, value):
        if not value:
            self.id_attachment = get_random_string(length=32)























@python_2_unicode_compatible
class Post(models.Model):
#from post
# log
    """
    changed from comment to post
    """
    # other meta
    """
     user === author
    # update- user != author

     
     topic === thread
     # no need to change this for api
    """
    
    
    # To Do List
    """
    Add parent
    Rating system no dislikes
    Rating system no likes
    Rating system no points
    Rating system no userScore
    
    

    author 	object 	Information about the comment author
    media 	array 	Links to images that the user attached to their comment.
# media not necessary at the moment

raw_message

mptt check for django-mptt !gh
    """


# done list
    """
date ==createdAt
description === message
    """
    

# id comment is not gonna change name, as they have some dependencies below, it helps not get confused
   
    #objects = PostManager()

#end post
   
# adding all required fields in order 

    isJuliaFlagged = models.BooleanField(default=False)
    isFlagged = models.BooleanField(default=False)
    forum = models.ForeignKey(Forum, related_name='comments', verbose_name=_('Forum'))
   # parent = models.ForeignKey('self', null=True, blank=True, default=None,related_name='children', verbose_name=_('Parent'))
    parent = models.CharField(max_length=20, blank=True, null=True)
   
    isDeleted = models.BooleanField(_('is removed'), default=False,
                                     help_text=_('Check this box if the comment is inappropriate. '
                                                 'A "This comment has been removed" message will '
                                                 'be displayed instead.'))
    isApproved = models.BooleanField(default=True)

    createdAt = models.DateTimeField(_('date/time submitted'), default=None)

    thread = models.ForeignKey(Thread, related_name='comments', verbose_name=_('Thread'))


    numReports = models.IntegerField(default=0)
    isEdited = models.BooleanField(default=False)

    message = models.TextField(_('Description'), max_length=COMMENT_MAX_LENGTH)

    isSpam = models.BooleanField(default=False)
    isHighlighted = models.BooleanField(default=False)

    ip_address = models.GenericIPAddressField(_('IP address'), unpack_ipv4=True, blank=True, null=True)
    is_public = models.BooleanField(_('is public'), default=True,
                                    help_text=_('Uncheck this box to make the comment effectively '
                                                'disappear from the site.'))

    last_child = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, verbose_name=_('Last child'))
    tree_path = models.CharField(_('Tree path'), max_length=500, editable=False)

    #tone = models.CharField(max_length=20, choices=TONE_CHOICES, verbose_name=_('Comment Tone'), db_index=True)

    author = models.ForeignKey(User, related_name='comments_author', verbose_name=_('User'))

    media = models.CharField(max_length=20, blank=True, null=True)

    points = models.IntegerField(default=0)

    dislikes = models.IntegerField(default=0)

    likes = models.IntegerField(default=0)
 
    raw_message = models.CharField(max_length=2000, blank=True, null=True)

    depth = models.IntegerField(default=0)

    isDeletedByAuthor = models.BooleanField(default=False)


    class Meta(object):
        ordering = ['createdAt']
        verbose_name = _('Post')
        verbose_name_plural = _('Posts')

    def __str__(self):
        return str(self.message)













class Cursor(models.Model):
    hasPrev = models.BooleanField(default=False)
    total = models.IntegerField(default=1)
    prev = models.CharField(max_length=20, blank=True, null=True)
    hasNext = models.BooleanField(default=True)
    next = models.CharField(default='1:0:0', max_length=10)



class Response(models.Model):
    lastModified = models.IntegerField(default=0)
    posts = models.ForeignKey(Post, related_name='response_posts',verbose_name=_('response_posts'))
    thread = models.ForeignKey(Thread, related_name='response_thread',verbose_name=_('response_thread'))





class Threaddata(models.Model):
    cursor = models.ForeignKey(Cursor, related_name='cursor', verbose_name=_('Cursor'))
    code = models.IntegerField(default=0)
    response = models. ForeignKey(Response, related_name='response', verbose_name=_('Response'))
    order = models.CharField(default='desc', max_length=10)
    






class Feature(models.Model):
    sso = models.BooleanField(default=False)

class Session(models.Model):
    
    mustVerify= models.BooleanField(default=0)
    
    mustVerifyEmail= models.BooleanField(default=0)

   
    audienceSyncVerified = models.BooleanField(default=0)
    canModerate = models.BooleanField(default=0)
    canReply = models.BooleanField(default=1)

  

class Forumdata(models.Model):
    session = models.ForeignKey(Session, related_name='forum_session_data')
    features = models. ForeignKey(Feature, related_name='Feature', verbose_name=_('Feature'))
    forum = models. ForeignKey(Forum, related_name='forumdata_', verbose_name=_('forumdata'))
    'session', 'features', 'forum'










