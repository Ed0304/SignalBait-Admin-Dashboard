#Handles app level routing.
from django.urls import path
from . import views

urlpatterns = [
    path("login/", views.login),
    path("logout/", views.logout),
    path("me/", views.me),
    path("tickets/", views.tickets),
    path(
        "tickets/<int:ticket_id>/",
        views.ticket_detail,
        name="ticket-detail"
    ),
    path("analytics/",views.analytics),
    path("audit-logs/", views.audit_logs, name="audit-logs"),
]