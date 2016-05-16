from django.conf.urls import url
from django.contrib.auth.views import logout as django_logout

from accounts import views

urlpatterns = [
    url(r'^login$', views.persona_login, name='persona_login'),
    url(r'^logout$', django_logout, {'next_page': '/'}, name='logout'),
]
