from django.contrib import admin
from .models import Organization, Department, Tender


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "district")


@admin.register(Tender)
class TenderAdmin(admin.ModelAdmin):

    list_display = (
        "tender_id",
        "title",
        "department",
        "organization",
        "district",
        "closing_date",
        "status",
    )

    list_filter = (
        "department",
        "status",
        "district",
    )

    search_fields = (
        "title",
        "tender_id",
        "organization",
    )