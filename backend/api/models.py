from django.contrib.auth.models import User
from django.db import models

# Create your models here.
class Ticket(models.Model):
    ticket_id = models.BigIntegerField(primary_key=True)
    created_at = models.DateTimeField()
    issue_type = models.CharField(max_length=255)
    reporter_email = models.EmailField()
    ticket_status = models.CharField(max_length=20)

    class Meta:
        db_table = "tickets"

class AuditLog(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    action = models.CharField(max_length=255)

    ticket_id = models.BigIntegerField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "audit_logs"
        ordering = ["-created_at"]