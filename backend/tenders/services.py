from tenders.api.ap_eprocurement import APEProcurementSync
from tenders.services.repository import TenderRepository


class TenderSyncService:

    def sync(self):

        print("=" * 50)
        print("Tender Synchronization Started")
        print("=" * 50)

        sync = APEProcurementSync()

        sync.start_session()

        tenders = sync.fetch_first_page()

        repository = TenderRepository()

        for tender in tenders:
            repository.save(tender)

        print(f"{len(tenders)} tenders saved successfully.")