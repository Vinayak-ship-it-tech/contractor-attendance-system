



class TenderParser:

    def parse(self, json_data):

        tenders = []

        for row in json_data.get("aaData", []):

            tender = {

                "organization": row[0],

                "tender_id": row[1],

                "notice_number": row[2],

                "category": row[3],

                "work_name": row[4],

                "estimated_value": row[5],

                "start_date": row[6],

                "closing_date": row[7],

                "action_html": row[8]

            }

            tenders.append(tender)

        return tenders