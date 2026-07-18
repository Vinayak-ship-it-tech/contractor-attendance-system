from abc import ABC, abstractmethod


class BaseTenderSync(ABC):
    """
    Base class for all tender synchronization modules.
    """

    @abstractmethod
    def fetch_tenders(self):
        pass

    @abstractmethod
    def save_tenders(self, tenders):
        pass

    def sync(self):
        tenders = self.fetch_tenders()
        self.save_tenders(tenders)