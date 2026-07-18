from tenders.api.ap_eprocurement import APEProcurementSync
from tenders.services.repository import TenderRepository
from tenders.models import TenderNotification


class TenderSyncService:

    def sync(self):

        print("=" * 60)
        print("Tender Synchronization Started")
        print("=" * 60)

        client = APEProcurementSync()
        repository = TenderRepository()

        client.start_session()

        start = 0
        length = 100

        total_saved = 0

        while True:

            print(f"\nFetching records {start} - {start + length}")

            result = client.fetch_page(start=start, length=length)

            tenders = result["tenders"]

            if not tenders:
                print("\nNo more tenders found.")
                break

            for tender in tenders:

                tender_obj, status = repository.save(tender)

                if status == "NEW":

                    TenderNotification.objects.create(
                        tender=tender_obj,
                        notification_type="NEW",
                        message=f"New Tender Published: {tender_obj.title}"
                    )

                elif status == "UPDATED":

                    TenderNotification.objects.create(
                        tender=tender_obj,
                        notification_type="UPDATED",
                        message=f"Tender Updated: {tender_obj.title}"
                    )

                total_saved += 1

            total_saved += len(tenders)

            print(f"Saved {len(tenders)} tenders")

            start += length

        print("=" * 60)
        print(f"Synchronization Completed")
        print(f"Total Tenders Saved: {total_saved}")
        print("=" * 60)