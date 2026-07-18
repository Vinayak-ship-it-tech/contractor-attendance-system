from django.db import models

class Organization(models.Model):
    name = models.CharField(max_length=255, unique=True)

    district = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    def __str__(self):
        return self.name

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)

    icon = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    color = models.CharField(
        max_length=30,
        default="#2563EB"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Tender(models.Model):
    STATUS_CHOICES = (
        ("Open", "Open"),
        ("Closed", "Closed"),
        ("Cancelled", "Cancelled"),
    )

    tender_id = models.CharField(max_length=100, unique=True)

    title = models.CharField(max_length=500)

    notice_number = models.TextField(
        blank=True,
        null=True
    )

    category = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name="tenders"
    )

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE
    )

    district = models.CharField(max_length=100)

    tender_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )

    emd_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )

    tender_fee = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )

    published_date = models.DateField()

    closing_date = models.DateField()

    opening_date = models.DateField(
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Open"
    )

    document_url = models.URLField(
        blank=True,
        null=True
    )

    action_html = models.TextField(
        blank=True,
        null=True
    )

    source = models.CharField(
        max_length=50,
        default="AP eProcurement"
    )

    last_synced = models.DateTimeField(
        auto_now=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_date"]

    def __str__(self):
        return f"{self.tender_id} - {self.title}"
    
class TenderNotification(models.Model):

    NOTIFICATION_TYPES = (
        ("NEW", "New Tender"),
        ("UPDATED", "Tender Updated"),
        ("CORRIGENDUM", "Corrigendum"),
        ("CLOSING_TODAY", "Closing Today"),
        ("CLOSING_TOMORROW", "Closing Tomorrow"),
    )

    tender = models.ForeignKey(
        Tender,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    notification_type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPES
    )

    message = models.TextField()

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.notification_type} - {self.tender.title}"