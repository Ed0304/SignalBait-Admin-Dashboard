#Handles app level routing.
from django.urls import path
from . import views

urlpatterns = [
    path("login/", views.login),
    path("logout/", views.logout),
    path("me/", views.me),
]