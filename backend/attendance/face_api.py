import requests
from decouple import config

FACE_API_URL = config("FACE_API_URL")
FACE_API_KEY = config("FACE_API_KEY")


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

    return response.json()