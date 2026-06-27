from django.db import models
from django.utils import timezone
from datetime import date


class Department(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class WorkSite(models.Model):
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    site_name = models.CharField(max_length=100)
    address = models.TextField(blank=True)
    latitude = models.CharField(max_length=50, blank=True)
    longitude = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        if self.department:
            return f"{self.department.name} - {self.site_name}"
        return self.site_name


class Worker(models.Model):
    WORKER_TYPE = (
        ('permanent', 'Permanent'),
        ('temporary', 'Temporary'),
    )

    name = models.CharField(max_length=100)
    age = models.IntegerField(null=True, blank=True)
    phone = models.CharField(max_length=15, blank=True, null=True)

    worker_type = models.CharField(
        max_length=20,
        choices=WORKER_TYPE,
        default='permanent'
    )
    photo = models.ImageField(
    upload_to="workers/",
    null=True,
    blank=True
    )

    face_embedding = models.JSONField(
        null=True,
        blank=True
    )

    daily_wage = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    hourly_wage = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    work_site = models.ForeignKey(
        WorkSite,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    face_image = models.ImageField(
        upload_to="workers/",
        null=True,
        blank=True
    )

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Attendance(models.Model):
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE)

    work_site = models.ForeignKey(
        WorkSite,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    date = models.DateField(auto_now_add=True)
    check_in_time = models.TimeField(auto_now_add=True)
    check_out_time = models.TimeField(blank=True, null=True)

    total_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )

    location = models.CharField(max_length=255, blank=True)
    latitude = models.CharField(max_length=50, blank=True, null=True)
    longitude = models.CharField(max_length=50, blank=True, null=True)

    group_photo = models.ImageField(
        upload_to='attendance_photos/',
        blank=True,
        null=True
    )

    marked_photo = models.ImageField(
        upload_to='marked_attendance/',
        blank=True,
        null=True
    )

    status = models.CharField(max_length=20, default='Present')

    def __str__(self):
        return f"{self.worker.name} - {self.date}"


class UnknownPerson(models.Model):
    image = models.ImageField(upload_to='unknown_faces/')
    date = models.DateField(auto_now_add=True)
    time = models.TimeField(auto_now_add=True)
    location = models.CharField(max_length=255, blank=True)
    is_registered = models.BooleanField(default=False)

    def __str__(self):
        return f"Unknown Person - {self.date}"


class Salary(models.Model):
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE)
    month = models.IntegerField()
    year = models.IntegerField()
    total_days = models.IntegerField(default=0)

    total_hours = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    total_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    def __str__(self):
        return f"{self.worker.name} salary"


class AttendanceCorrection(models.Model):
    attendance = models.ForeignKey(Attendance, on_delete=models.CASCADE)

    old_worker = models.ForeignKey(
        Worker,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="old_corrections"
    )

    corrected_worker = models.ForeignKey(
        Worker,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="corrected_corrections"
    )

    reason = models.CharField(max_length=255, blank=True, null=True)
    corrected_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return "Attendance Correction"


class WorkerFaceHistory(models.Model):
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE)
    face_image = models.ImageField(upload_to='worker_face_history/')
    location = models.CharField(max_length=255, blank=True)
    date = models.DateField(auto_now_add=True)
    time = models.TimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.worker.name} - {self.date}"


class WorkerFaceEncoding(models.Model):
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE)
    face_image = models.ImageField(upload_to="worker_learned_faces/")

    face_embedding = models.JSONField()

    learned_from_unknown = models.ForeignKey(
        UnknownPerson,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Learned face - {self.worker.name}"
    
    

def group_photo_upload_path(instance, filename):
    organization = "Unknown_Organization"
    site = "Unknown_Site"
    today = date.today().strftime("%Y_%m_%d")

    if instance.work_site:
        site = instance.work_site.site_name.replace(" ", "_")

        if instance.work_site.department:
            organization = instance.work_site.department.name.replace(" ", "_")

    return f"group_attendance/{organization}/{site}/{today}/{filename}"


class GroupPhotoUpload(models.Model):
    work_site = models.ForeignKey(
        WorkSite,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    group_photo = models.ImageField(upload_to=group_photo_upload_path)

    marked_photo = models.ImageField(
        upload_to='marked_group_photos/',
        blank=True,
        null=True
    )

    location = models.CharField(max_length=255, blank=True)
    latitude = models.CharField(max_length=50, blank=True)
    longitude = models.CharField(max_length=50, blank=True)

    date = models.DateField(auto_now_add=True)
    time = models.TimeField(auto_now_add=True)

    def __str__(self):
        return f"Group Photo - {self.date}"


class AdvancePayment(models.Model):
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField(blank=True)
    payment_date = models.DateField(auto_now_add=True)
    is_deducted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.worker.name} - ₹{self.amount}"


class Site(models.Model):
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name="sites"
    )

    name = models.CharField(max_length=150)
    location = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.department.name} - {self.name}"


def work_photo_upload_path(instance, filename):
    department = instance.site.department.name.replace(" ", "_")
    site = instance.site.name.replace(" ", "_")
    month = instance.bill_month.strftime("%Y_%B")
    photo_type = instance.photo_type

    return f"work_photos/{department}/{site}/{month}/{photo_type}/{filename}"


class WorkPhoto(models.Model):
    PHOTO_TYPES = [
        ("before", "Before Work"),
        ("during", "During Work"),
        ("after", "After Work"),
    ]

    site = models.ForeignKey(
        Site,
        on_delete=models.CASCADE,
        related_name="work_photos"
    )

    bill_month = models.DateField()
    photo_type = models.CharField(max_length=20, choices=PHOTO_TYPES)
    photo = models.ImageField(upload_to=work_photo_upload_path)
    description = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.site.name} - {self.photo_type}"
    

class Bill(models.Model):
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE
    )

    site = models.ForeignKey(
        Site,
        on_delete=models.CASCADE
    )

    bill_month = models.DateField()

    work_description = models.TextField(blank=True, null=True)

    salary_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    material_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    other_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    status = models.CharField(
        max_length=30,
        default="Pending"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.total_amount = (
            self.salary_amount +
            self.material_amount +
            self.other_amount
        )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.site.name} - {self.bill_month}"
    
class OfflineAttendance(models.Model):
    worker = models.ForeignKey(
        Worker,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    date = models.DateField()
    check_in = models.CharField(max_length=50)
    latitude = models.CharField(max_length=100)
    longitude = models.CharField(max_length=100)
    status = models.CharField(max_length=20)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.worker} - {self.date}"