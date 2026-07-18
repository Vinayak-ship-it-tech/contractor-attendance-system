import re
from decimal import Decimal
from datetime import datetime

from tenders.models import (
    Organization,
    Department,
    Tender,
)


class TenderRepository:

    def save(self, tender):

        organization, _ = Organization.objects.get_or_create(
            name=tender["organization"]
        )

        department, _ = Department.objects.get_or_create(
            name=self.detect_department(tender["work_name"])
        )

        Tender.objects.update_or_create(
            tender_id=tender["tender_id"],
            defaults={
                "title": tender["work_name"],
                "notice_number": tender["notice_number"],
                "category": tender["category"],
                "organization": organization,
                "department": department,
                "district": "",
                "tender_value": self.parse_amount(
                    tender["estimated_value"]
                ),
                "emd_amount": Decimal("0"),
                "tender_fee": Decimal("0"),
                "published_date": self.parse_date(
                    tender["start_date"]
                ),
                "closing_date": self.parse_date(
                    tender["closing_date"]
                ),
                "status": "Open",
                "action_html": tender["action_html"],
            }
        )

    def parse_amount(self, value):

        value = re.sub(r"[^\d.]", "", value)

        if value == "":
            return Decimal("0")

        return Decimal(value)

    def parse_date(self, value):
        try:
            return datetime.strptime(
                value.strip(),
                "%d/%m/%Y %I:%M %p"
            ).date()
        except (ValueError, AttributeError):
            return None

    def detect_department(self, text):

        text = text.lower()

        mapping = {
            "horticulture": "Horticulture",
            "garden": "Horticulture",
            "civil": "Civil",
            "road": "Civil",
            "electrical": "Electrical",
            "lighting": "Electrical",
            "security": "Security",
            "house keeping": "House Keeping",
            "housekeeping": "House Keeping",
            "sanitation": "Sanitation",
            "mechanical": "Mechanical",
        }

        for keyword, department in mapping.items():
            if keyword in text:
                return department

        return "General"