import requests
import logging
import base64
import json
from tenders.services.parser import TenderParser

logger = logging.getLogger(__name__)


class APEProcurementSync:

    BASE_URL = "https://tender.apeprocurement.gov.in"

    def __init__(self):
        self.session = requests.Session()

        self.session.headers.update({
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 "
                "(KHTML, like Gecko) "
                "Chrome/138.0.0.0 Safari/537.36"
            ),
            "X-Requested-With": "XMLHttpRequest"
        })

    def start_session(self):

        print("=" * 50)
        print("Connecting to AP eProcurement...")

        response = self.session.get(
            f"{self.BASE_URL}/TenderDetailsHome.html"
        )

        print(f"Status Code : {response.status_code}")
        print("=" * 50)

        return response.status_code
    
    def fetch_page(self, start=0, length=100):

        print("=" * 50)
        print("Downloading Tender List...")
        print("=" * 50)

        url = f"{self.BASE_URL}/TenderDetailsHomeJson.html"

        params = {
            "nTenderID": "",
            "nDepartmentID": "",
            "subDeptId": "",
            "ddlDistrict": "",
            "ddlMandal": "",
            "biddingType": "",
            "sProcurementType": "",
            "mECVValue1": "",
            "mECVValue2": "",
            "dtBidClosingselect": "",
            "dtBidClosing1": "",
            "dtBidClosing2": "",
            "dtTenderOpening1": "",
            "dtTenderOpening2": "",
            "hdnSearch4": "",
            "hdnSearch": "",
            "hdncorrigendumsDetails": "",
            "hdncorrigendumsDetails1": "",
            "hdnnoSearch": "",
            "hdncorrigendumsDetails2": "",
            "hdnadvsearch": "",
            "hdnPreviousPage": "",
            "hdnIndentID": "",
            "hdnTenderCategory": "",
            "hdnProcurementID": "",
            "hdnType": "current",
            "hdnPreviousPge": "TenderDetailsHome.html",
            "hdnFromStatus": "",
            "typeOfWorkFromConsolidation": "",
            "popUPRequestParameter": "",
            "selectedCircleDivison": "",
            "selectedDepartmentID": "",
            "selectedProcurementType": "",
            "selectedTypeofWork": "",
            "aid": "",
            "hdnEncryptNames": "hdnEncryptNames",
            "hdnEncryptValues": "hdnEncryptValues",
            "sEcho": "1",
            "iColumns": "9",
            "sColumns": ",,,,,,,,",
            "iDisplayStart": start,
            "iDisplayLength": length,
            "mDataProp_0": "0",
            "bSortable_0": "true",
            "mDataProp_1": "1",
            "bSortable_1": "true",
            "mDataProp_2": "2",
            "bSortable_2": "true",
            "mDataProp_3": "3",
            "bSortable_3": "true",
            "mDataProp_4": "4",
            "bSortable_4": "true",
            "mDataProp_5": "5",
            "bSortable_5": "true",
            "mDataProp_6": "6",
            "bSortable_6": "true",
            "mDataProp_7": "7",
            "bSortable_7": "true",
            "mDataProp_8": "8",
            "bSortable_8": "false",
            "iSortCol_0": "5",
            "sSortDir_0": "desc",
            "iSortingCols": "1",
        }

        response = self.session.get(url, params=params)

        print("HTTP Status:", response.status_code)
        print("\nFirst 500 characters of response:\n")
        
        encoded = response.text.strip()

        decoded = base64.b64decode(encoded)

        json_data = json.loads(decoded)
        print(f"Requested Start : {start}")
        print(f"Requested Length: {length}")
        print(f"Returned Records: {len(json_data.get('aaData', []))}")
        print(f"Total Records   : {json_data.get('iTotalRecords')}")

        print("=" * 50)
        print("JSON Decoded Successfully")
        print("=" * 50)

        print("Keys:")

        for key in json_data.keys():
            print("-", key)

        print("\nTotal Records:", json_data.get("iTotalRecords"))

        print("\nReturned Records:", len(json_data.get("aaData", [])))

        if json_data.get("aaData"):
            print("\nFirst Tender:\n")
            print(json.dumps(json_data["aaData"][0], indent=4))
        else:
            print("\nNo tenders returned for this page.")

        parser = TenderParser()

        tenders = parser.parse(json_data)

        print("=" * 50)
        print(f"Parsed {len(tenders)} tenders")
        print("=" * 50)

        if tenders:
            print(tenders[0])

        return {
            "tenders": tenders,
            "total_records": json_data.get("iTotalRecords"),
        }