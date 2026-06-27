import requests
from decouple import config

FACE_API_URL = config("FACE_API_URL", default="")
FACE_API_KEY = config("FACE_API_KEY", default="")


def extract_face_embedding(photo_file):
    headers = {
        "x-api-key": FACE_API_KEY
    }

    files = {
        "photo": photo_file
    }

    response = requests.post(
        f"{FACE_API_URL}/extract-face/",
        headers=headers,
        files=files,
        timeout=60
    )

    if response.status_code != 200:
        return {
            "success": False,
            "message": "Face API failed",
            "details": response.text
        }

    return response.json()


def detect_group_faces(photo_file):
    headers = {
        "x-api-key": FACE_API_KEY
    }

    files = {
        "photo": photo_file
    }

    response = requests.post(
        f"{FACE_API_URL}/detect-group/",
        headers=headers,
        files=files,
        timeout=120
    )

    if response.status_code != 200:
        return {
            "success": False,
            "message": "Face API failed",
            "details": response.text,
            "faces": []
        }

    return response.json()