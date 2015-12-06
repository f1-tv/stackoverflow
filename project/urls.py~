"""project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import include, url
from django.contrib import admin


from reflect.views import Jav, Java, Sty, Javar, Styl, Style, Javasr, Javascr, Javascri, Javascrip, Javascript, Styler, Styleri, Styleris, Stylerist, Javascripti, Embed, Count, embedcomments

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^' , include('reflect.urls')),
    url(r'embed/comments/[base=](?P<base>\w+)&[version=](?P<version>\w+)&[f=](?P<f>\w+)&[[t_i=](?P<t_i>\w+)&]?[t_u=](?P<t_u>\w+)&[[t_s=](?P<t_s>\w+)&]?[[t_e=](?P<t_e>\w+)&]?[[t_d=](?P<t_d>\w+)&]?[t_t=](?P<t_t>\w+)&[[t_c=](?P<t_c>\w+)&]?[s_o=](?P<s_o>\w+)&[[l=](?P<l>\w+)&]?$', views.embedcomments,),


#for javascript
    url(r'^next/embed/onboard.load.74629aaa32655c2e6f4b24ea139b9588.js', Jav.as_view()),
    url(r'^next/embed/lounge.load.104feca2c767b6d7ee0b10d93beeec41.js', Java.as_view()),
    url(r'^next/embed/styles/loading.aaa873ed4a78106f29994d34d7eabec1.css', Sty.as_view()),
    url(r'^next/embed/onboard.bundle.acb5cc31dd9945f747781741d77c3ca0.js', Javar.as_view()),
    url(r'^next/embed/styles/onboard.2506c1ec14ef8f1458ce7e1a5c25b41e.css', Styl.as_view()),
    url(r'^next/embed/styles/onboard_rtl.8e4c4b668a1e7a0802e1803103266a67.css', Style.as_view()),
    url(r'^next/embed/common.bundle.ea27411799c4b519ccba088d8128f69b.js', Javasr.as_view()),
    url(r'^next/embed/discovery.bundle.7e1ddeee2389924c7bd81848bd4b2811.js', Javascr.as_view()),
    url(r'^next/embed/highlight.0faa05361b05582ff85f4eff7fda997e.js', Javascri.as_view()),
    url(r'^next/embed/alfie.f51946af45e0b561c60f768335c9eb79.js', Javascrip.as_view()),
    url(r'^next/embed/lounge.bundle.2e1b127fc3fbc843564151b8659f9265.js', Javascript.as_view()),
    url(r'^next/embed/styles/lounge.fcc2aae7ac79584a0849157bcc4b0f37.css', Styler.as_view()),
    url(r'^next/embed/styles/lounge_rtl.ee9161fd5bc5db11769dcef8c444bbd9.css', Styleri.as_view()),
    url(r'^next/embed/styles/discovery.1fe89d176a9928445563cdce9d8680d4.css', Styleris.as_view()),
    url(r'^next/embed/styles/discovery_rtl.916d71fb6963105e91d0516bd34ad29a.css', Stylerist.as_view()),
    url(r'^next/embed/adclient.bundle.9e7c14d0b6675e0a0d79a343c80a0b8a.js', Javascripti.as_view()),
    url(r'^embed.js', Embed.as_view()),
    url(r'^count.js', Count.as_view()),
]
