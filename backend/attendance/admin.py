from django.contrib import admin
from .models import (
    Worker,
    Attendance,
    UnknownPerson,
    Salary,
    AttendanceCorrection,
    WorkSite,
    Department,
    Site,
    WorkPhoto,
)

admin.site.register(Worker)
admin.site.register(Attendance)
admin.site.register(UnknownPerson)
admin.site.register(Salary)
admin.site.register(AttendanceCorrection)
admin.site.register(WorkSite)
admin.site.register(Department)
admin.site.register(Site)
admin.site.register(WorkPhoto)