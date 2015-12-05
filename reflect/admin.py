from django.contrib import admin
from .models import Category, Forum, Settings, Thread, Post, Cursor, Response, Threaddata, Forumdata, Session, Feature


class CategoryAdmin(admin.ModelAdmin):
    pass


class ForumAdmin(admin.ModelAdmin):
    pass


class SettingsAdmin(admin.ModelAdmin):
    pass


class ThreadAdmin(admin.ModelAdmin):
    pass


class PostAdmin(admin.ModelAdmin):
    pass

class CursorAdmin(admin.ModelAdmin):
    pass

class ResponseAdmin(admin.ModelAdmin):
    pass

class ThreaddataAdmin(admin.ModelAdmin):
    pass



class FeatureAdmin(admin.ModelAdmin):
    pass

class SessionAdmin(admin.ModelAdmin):
    pass


class ForumdataAdmin(admin.ModelAdmin):
    pass


admin.site.register(Category, CategoryAdmin)
admin.site.register(Forum, ForumAdmin)
admin.site.register(Settings, SettingsAdmin)
admin.site.register(Thread, ThreadAdmin)
admin.site.register(Post, PostAdmin)

admin.site.register(Cursor, CursorAdmin)
admin.site.register(Response, ResponseAdmin)
admin.site.register(Threaddata, ThreaddataAdmin)




admin.site.register(Feature, FeatureAdmin)

admin.site.register(Session, SessionAdmin)
admin.site.register(Forumdata, ForumdataAdmin)












