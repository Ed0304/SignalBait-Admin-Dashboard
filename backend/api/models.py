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