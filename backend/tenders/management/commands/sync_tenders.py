from django.core.management.base import BaseCommand

from tenders.services.sync_service import TenderSyncService


class Command(BaseCommand):

    help = "Synchronize tenders"

    def handle(self, *args, **kwargs):

        self.stdout.write("Starting Tender Synchronization...")

        service = TenderSyncService()

        service.sync()

        self.stdout.write(
            self.style.SUCCESS(
                "Tender Synchronization Completed."
            )
        )