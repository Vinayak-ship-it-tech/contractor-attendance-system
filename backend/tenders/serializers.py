from rest_framework import serializers
from .models import Tender, Organization, Department
from .models import TenderNotification


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = "__all__"


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"


class TenderSerializer(serializers.ModelSerializer):

    organization_name = serializers.CharField(
        source="organization.name",
        read_only=True
    )

    department_name = serializers.CharField(
        source="department.name",
        read_only=True
    )

    class Meta:
        model = Tender

        fields = [
            "id",
            "tender_id",
            "title",
            "notice_number",
            "category",
            "organization",
            "organization_name",
            "department",
            "department_name",
            "district",
            "tender_value",
            "emd_amount",
            "tender_fee",
            "published_date",
            "closing_date",
            "opening_date",
            "status",
            "document_url",
            "action_html",
            "source",
            "last_synced",
            "created_at",
            "updated_at",
        ]

class TenderNotificationSerializer(serializers.ModelSerializer):

    tender_title = serializers.CharField(
        source="tender.title",
        read_only=True
    )

    organization = serializers.CharField(
        source="tender.organization.name",
        read_only=True
    )

    department = serializers.CharField(
        source="tender.department.name",
        read_only=True
    )

    class Meta:
        model = TenderNotification

        fields = [
            "id",
            "notification_type",
            "message",
            "is_read",
            "created_at",
            "tender",
            "tender_title",
            "organization",
            "department",
        ]