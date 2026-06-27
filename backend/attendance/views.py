from datetime import date, datetime
from decimal import Decimal
from io import BytesIO
import io
import requests

import cv2
import numpy as np
import speech_recognition as sr
from PIL import Image, ImageDraw

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from django.db import models
from django.db.models import Sum
from django.http import FileResponse, HttpResponse

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as PDFImage

from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import OfflineAttendance
from .serializers import OfflineAttendanceSerializer
#import face_recognition
try:
    import face_recognition
except ImportError:
    face_recognition = None
from reportlab.lib.units import mm
from reportlab.lib import colors
from .models import Worker
from .models import WorkerFaceEncoding
from .face_api import extract_face_embedding, detect_group_faces
from django.conf import settings

from .models import (
    Worker,
    Attendance,
    UnknownPerson,
    WorkerFaceHistory,
    AttendanceCorrection,
    WorkSite,
    GroupPhotoUpload,
    AdvancePayment,
    Department,
    Site,
    WorkPhoto,
    Bill,
    WorkerFaceEncoding,
)

from .serializers import (
    WorkerSerializer,
    AttendanceSerializer,
    UnknownPersonSerializer,
    WorkerFaceHistorySerializer,
    WorkSiteSerializer,
    GroupPhotoUploadSerializer,
    AdvancePaymentSerializer,
    DepartmentSerializer,
    SiteSerializer,
    WorkPhotoSerializer,
    BillSerializer,
)


@api_view(["POST"])
@permission_classes([AllowAny])
def admin_login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user is None:
        return Response({"error": "Invalid username or password"}, status=400)

    if not user.is_superuser:
        return Response({"error": "Only admin can login"}, status=403)

    token, created = Token.objects.get_or_create(user=user)

    return Response({
        "token": token.key,
        "username": user.username,
        "is_admin": user.is_superuser
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not username or not email or not password:
        return Response({"error": "All fields are required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    Token.objects.create(user=user)

    return Response({"message": "User registered successfully"}, status=201)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def workers(request):
    if request.method == "GET":
        data = Worker.objects.all()
        serializer = WorkerSerializer(data, many=True)
        return Response(serializer.data)

    serializer = WorkerSerializer(data=request.data)

    if serializer.is_valid():
        worker = serializer.save()

        photo = request.FILES.get("face_image") or request.FILES.get("photo")

        if photo:
            try:
                photo.seek(0)
                hf_result = extract_face_embedding(photo)

                if hf_result.get("success"):
                    worker.face_embedding = hf_result.get("embedding")
                    worker.save()
                else:
                    return Response({
                        "message": "Worker added, but face not detected",
                        "worker_id": worker.id,
                        "face_api_message": hf_result.get("message")
                    }, status=201)

            except Exception as e:
                return Response({
                    "message": "Worker added, but Hugging Face API failed",
                    "worker_id": worker.id,
                    "error": str(e)
                }, status=201)

        return Response({
            "message": "Worker added successfully",
            "worker_id": worker.id
        }, status=201)

    return Response(serializer.errors, status=400)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def worker_detail(request, worker_id):
    try:
        worker = Worker.objects.get(id=worker_id)
    except Worker.DoesNotExist:
        return Response({"error": "Worker not found"}, status=404)

    if request.method == "GET":
        serializer = WorkerSerializer(worker)
        return Response(serializer.data)

    if request.method in ["PUT", "PATCH"]:
        serializer = WorkerSerializer(worker, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Worker updated successfully"})

        return Response(serializer.errors, status=400)

    if request.method == "DELETE":
        worker.delete()
        return Response({"message": "Worker deleted successfully"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_worker_status(request, worker_id):
    try:
        worker = Worker.objects.get(id=worker_id)
    except Worker.DoesNotExist:
        return Response({"error": "Worker not found"}, status=404)

    worker.is_active = not worker.is_active
    worker.save()

    return Response({
        "message": "Worker status updated",
        "is_active": worker.is_active
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def attendance_list(request):
    selected_date = request.GET.get("date")
    department_id = request.GET.get("department_id")

    data = Attendance.objects.all().order_by("-date", "-check_in_time")

    if selected_date:
        data = data.filter(date=selected_date)

    if department_id:
        data = data.filter(work_site__department_id=department_id)

    serializer = AttendanceSerializer(data, many=True)
    return Response(serializer.data)


def detect_face_spoof(face_image):
    try:
        gray = cv2.cvtColor(face_image, cv2.COLOR_RGB2GRAY)
        blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
        brightness = gray.mean()

        if blur_score < 40:
            return False

        if brightness < 40 or brightness > 230:
            return False

        return True

    except Exception:
        return False
def _build_absolute_media_url(request, file_field):
    if not file_field:
        return ""

    try:
        return request.build_absolute_uri(file_field.url)
    except Exception:
        return ""


def _get_worker_face_encoding(worker):
    try:
        if not worker.face_image:
            return None

        image = face_recognition.load_image_file(worker.face_image.path)
        encodings = face_recognition.face_encodings(image)

        if len(encodings) == 0:
            return None

        return encodings[0]

    except Exception:
        return None
    
def get_all_worker_encodings():
    known_workers = []
    known_encodings = []

    for worker in Worker.objects.filter(is_active=True):
        main_encoding = _get_worker_face_encoding(worker)

        if main_encoding is not None:
            known_workers.append(worker)
            known_encodings.append(main_encoding)

        learned_faces = WorkerFaceEncoding.objects.filter(worker=worker)

        for learned_face in learned_faces:
            known_workers.append(worker)
            known_encodings.append(np.array(learned_face.face_encoding))

    return known_workers, known_encodings

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_group_photo(request):
    group_photo = request.FILES.get("group_photo")
    location = request.data.get("location", "Location not provided")
    latitude = request.data.get("latitude", "")
    longitude = request.data.get("longitude", "")
    work_site_id = request.data.get("work_site")

    if not group_photo:
        return Response({"error": "Group photo is required"}, status=400)

    if not work_site_id:
        return Response({"error": "Work site is required"}, status=400)

    try:
        work_site = WorkSite.objects.get(id=work_site_id)
    except WorkSite.DoesNotExist:
        return Response({"error": "Invalid work site"}, status=404)

    group_upload = GroupPhotoUpload.objects.create(
        work_site=work_site,
        group_photo=group_photo,
        location=location,
        latitude=latitude,
        longitude=longitude,
    )

    try:
        with open(group_upload.group_photo.path, "rb") as img:
            files = {
                "photo": (
                    group_upload.group_photo.name,
                    img,
                    "image/jpeg",
                )
            }

            hf_response = requests.post(
                f"{settings.FACE_API_URL}/detect-group/",
                files=files,
                timeout=120,
            )

        if hf_response.status_code != 200:
            return Response({
                "error": "Face API failed",
                "details": hf_response.text,
            }, status=500)

        face_result = hf_response.json()

    except Exception as e:
        return Response({
            "error": "Unable to connect to Hugging Face Face API",
            "details": str(e),
        }, status=500)

    detected_faces = face_result.get("faces", [])

    matched_workers = []
    already_marked = []
    unknown_faces = []
    suspicious_faces = 0
    today = date.today()

    workers = Worker.objects.filter(
        is_active=True,
        face_embedding__isnull=False
    )

    threshold = 0.45

    for face in detected_faces:
        face_embedding = face.get("embedding")

        if not face_embedding:
            continue

        face_embedding = np.array(face_embedding)

        best_worker = None
        best_score = -1

        for worker in workers:
            worker_embedding = np.array(worker.face_embedding)

            similarity = np.dot(face_embedding, worker_embedding) / (
                np.linalg.norm(face_embedding) * np.linalg.norm(worker_embedding)
            )

            if similarity > best_score:
                best_score = similarity
                best_worker = worker

        if best_worker and best_score >= threshold:
            attendance, created = Attendance.objects.get_or_create(
                worker=best_worker,
                date=today,
                defaults={
                    "work_site": work_site,
                    "location": location,
                    "latitude": latitude,
                    "longitude": longitude,
                    "group_photo": group_upload.group_photo,
                    "status": "Present",
                },
            )

            if created:
                WorkerFaceHistory.objects.create(
                    worker=best_worker,
                    face_image=group_upload.group_photo,
                    location=location,
                )

                matched_workers.append({
                    "id": best_worker.id,
                    "name": best_worker.name,
                    "confidence": round(float(best_score), 3),
                })
            else:
                already_marked.append({
                    "id": best_worker.id,
                    "name": best_worker.name,
                    "confidence": round(float(best_score), 3),
                })

        else:
            unknown_person = UnknownPerson.objects.create(
                location=location
            )

            unknown_faces.append({
                "id": unknown_person.id,
                "location": unknown_person.location,
                "date": unknown_person.date,
                "time": unknown_person.time,
                "confidence": round(float(best_score), 3),
            })

    present_workers = [item["name"] for item in matched_workers]

    return Response({
        "message": "Group photo processed successfully",
        "organization": work_site.department.name if work_site.department else "",
        "site": work_site.site_name,
        "date": group_upload.date,
        "time": group_upload.time,
        "location": location,
        "latitude": latitude,
        "longitude": longitude,
        "total_faces_detected": len(detected_faces),
        "detected_faces": len(detected_faces),
        "matched_workers": matched_workers,
        "already_marked": already_marked,
        "unknown_faces": unknown_faces,
        "unknown_faces_count": len(unknown_faces),
        "suspicious_faces": suspicious_faces,
        "present_workers": present_workers,
        "marked_photo": "",
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def unknown_persons(request):
    data = UnknownPerson.objects.filter(is_registered=False).order_by("-id")
    serializer = UnknownPersonSerializer(data, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def register_unknown_worker(request):
    unknown_id = request.data.get("unknown_id")

    name = request.data.get("name")
    age = request.data.get("age")
    phone = request.data.get("phone")
    worker_type = request.data.get("worker_type", "temporary")
    daily_wage = request.data.get("daily_wage") or 0
    hourly_wage = request.data.get("hourly_wage") or 0

    if not unknown_id:
        return Response({"error": "Unknown person id is required"}, status=400)

    if not name:
        return Response({"error": "Worker name is required"}, status=400)

    try:
        unknown = UnknownPerson.objects.get(id=unknown_id)
    except UnknownPerson.DoesNotExist:
        return Response({"error": "Unknown person not found"}, status=404)

    worker = Worker.objects.create(
        name=name,
        age=age or None,
        phone=phone,
        worker_type=worker_type,
        daily_wage=daily_wage,
        hourly_wage=hourly_wage,
        face_image=unknown.image,
        is_active=True,
    )

    unknown.is_registered = True
    unknown.save()

    return Response({
        "message": "Unknown person registered successfully",
        "worker_id": worker.id,
        "worker_name": worker.name
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def register_unknown_person(request, unknown_id):
    try:
        unknown = UnknownPerson.objects.get(id=unknown_id)
    except UnknownPerson.DoesNotExist:
        return Response({"error": "Unknown person not found"}, status=404)

    name = request.data.get("name")
    phone = request.data.get("phone", "")
    worker_type = request.data.get("worker_type", "temporary")
    daily_wage = request.data.get("daily_wage", 0)
    hourly_wage = request.data.get("hourly_wage", 0)

    if not name:
        return Response({"error": "Worker name is required"}, status=400)

    worker = Worker.objects.create(
        name=name,
        phone=phone,
        worker_type=worker_type,
        daily_wage=daily_wage,
        hourly_wage=hourly_wage,
        face_image=unknown.image
    )

    unknown.is_registered = True
    unknown.save()

    return Response({
        "message": "Unknown person registered as worker",
        "worker": worker.name
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def checkout_worker(request, attendance_id):
    try:
        attendance = Attendance.objects.get(id=attendance_id)
    except Attendance.DoesNotExist:
        return Response({"error": "Attendance record not found"}, status=404)

    if attendance.check_out_time:
        return Response({"error": "Worker already checked out"}, status=400)

    checkout_time = datetime.now().time()
    attendance.check_out_time = checkout_time

    check_in_datetime = datetime.combine(attendance.date, attendance.check_in_time)
    check_out_datetime = datetime.combine(attendance.date, checkout_time)

    worked_seconds = (check_out_datetime - check_in_datetime).total_seconds()
    worked_hours = Decimal(worked_seconds / 3600).quantize(Decimal("0.01"))

    attendance.total_hours = worked_hours
    attendance.save()

    return Response({
        "message": "Checked out successfully",
        "worker": attendance.worker.name,
        "total_hours": attendance.total_hours
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def correct_attendance(request, attendance_id):
    try:
        attendance = Attendance.objects.get(id=attendance_id)
    except Attendance.DoesNotExist:
        return Response({"error": "Attendance record not found"}, status=404)

    corrected_worker_id = request.data.get("corrected_worker_id")
    reason = request.data.get("reason", "")

    try:
        corrected_worker = Worker.objects.get(id=corrected_worker_id)
    except Worker.DoesNotExist:
        return Response({"error": "Corrected worker not found"}, status=404)

    old_worker = attendance.worker

    AttendanceCorrection.objects.create(
        attendance=attendance,
        old_worker=old_worker,
        corrected_worker=corrected_worker,
        reason=reason
    )

    attendance.worker = corrected_worker
    attendance.save()

    return Response({
        "message": "Attendance corrected successfully",
        "old_worker": old_worker.name,
        "corrected_worker": corrected_worker.name
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def worker_face_history(request, worker_id):
    history = WorkerFaceHistory.objects.filter(
        worker_id=worker_id
    ).order_by("-date", "-time")

    serializer = WorkerFaceHistorySerializer(history, many=True)
    return Response(serializer.data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def work_sites(request):
    if request.method == "GET":
        sites = WorkSite.objects.all()
        serializer = WorkSiteSerializer(sites, many=True)
        return Response(serializer.data)

    serializer = WorkSiteSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Work site added successfully"})

    return Response(serializer.errors, status=400)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def work_site_detail(request, site_id):
    try:
        site = WorkSite.objects.get(id=site_id)
    except WorkSite.DoesNotExist:
        return Response({"error": "Work site not found"}, status=404)

    if request.method == "GET":
        serializer = WorkSiteSerializer(site)
        return Response(serializer.data)

    if request.method in ["PUT", "PATCH"]:
        serializer = WorkSiteSerializer(site, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Work site updated successfully"})

        return Response(serializer.errors, status=400)

    if request.method == "DELETE":
        site.is_active = False
        site.save()
        return Response({"message": "Work site disabled successfully"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def site_attendance(request, site_id):
    selected_date = request.GET.get("date")

    records = Attendance.objects.filter(
        work_site_id=site_id
    ).order_by("-date", "-check_in_time")

    if selected_date:
        records = records.filter(date=selected_date)

    serializer = AttendanceSerializer(records, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    today = date.today()

    total_workers = Worker.objects.count()
    active_workers = Worker.objects.filter(is_active=True).count()

    present_today = Attendance.objects.filter(
        date=today,
        status="Present"
    ).count()

    total_sites = WorkSite.objects.count()
    active_sites = WorkSite.objects.filter(is_active=True).count()

    pending_bills = Bill.objects.filter(status="Pending").count()
    paid_bills = Bill.objects.filter(status="Paid").count()

    monthly_salary = Decimal("0")

    current_month_records = Attendance.objects.filter(
        date__month=today.month,
        date__year=today.year,
        status="Present"
    )

    for record in current_month_records:
        daily = record.worker.daily_wage or 0
        hourly = record.worker.hourly_wage or 0
        hours = record.total_hours or 0

        monthly_salary += Decimal(daily) + (Decimal(hourly) * Decimal(hours))

    return Response({
        "total_workers": total_workers,
        "active_workers": active_workers,
        "present_today": present_today,
        "total_sites": total_sites,
        "active_sites": active_sites,
        "pending_bills": pending_bills,
        "paid_bills": paid_bills,
        "monthly_salary": monthly_salary,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def live_worker_count(request):
    today = date.today()

    total_workers = Worker.objects.filter(is_active=True).count()
    present_records = Attendance.objects.filter(date=today)

    present_today = present_records.values("worker").distinct().count()
    absent_today = total_workers - present_today
    unknown_today = UnknownPerson.objects.filter(is_registered=False).count()

    organizations = []

    work_sites = WorkSite.objects.filter(is_active=True)

    for site in work_sites:
        site_workers = Worker.objects.filter(
            is_active=True,
            work_site=site
        )

        site_present_records = present_records.filter(work_site=site)

        present_worker_ids = site_present_records.values_list(
            "worker_id",
            flat=True
        ).distinct()

        present_workers = site_workers.filter(id__in=present_worker_ids)
        absent_workers = site_workers.exclude(id__in=present_worker_ids)

        organizations.append({
            "organization": site.site_name,
            "present_count": present_workers.count(),
            "absent_count": absent_workers.count(),
            "present_workers": [worker.name for worker in present_workers],
            "absent_workers": [worker.name for worker in absent_workers],
        })

    return Response({
        "total_workers": total_workers,
        "present_today": present_today,
        "absent_today": absent_today,
        "unknown_today": unknown_today,
        "organizations": organizations,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def attendance_heatmap(request):
    worker_id = request.GET.get("worker_id")
    records = Attendance.objects.all()

    if worker_id:
        records = records.filter(worker_id=worker_id)

    heatmap_data = []

    dates = records.values("date").distinct()

    for item in dates:
        attendance_date = item["date"]

        count = records.filter(
            date=attendance_date
        ).values("worker").distinct().count()

        heatmap_data.append({
            "date": attendance_date,
            "count": count
        })

    return Response(heatmap_data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def group_photo_comparison(request):
    photos = GroupPhotoUpload.objects.all().order_by("-date", "-time")[:2]
    serializer = GroupPhotoUploadSerializer(photos, many=True)

    return Response({
        "message": "Latest two group photos",
        "photos": serializer.data
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def attendance_anomaly_detection(request):
    today = date.today()
    anomalies = []

    workers_data = Worker.objects.filter(is_active=True)

    for worker in workers_data:
        today_records = Attendance.objects.filter(
            worker=worker,
            date=today
        )

        if today_records.count() > 1:
            anomalies.append({
                "worker": worker.name,
                "type": "Duplicate Attendance",
                "message": f"{worker.name} has multiple attendance records today."
            })

        site_count = today_records.exclude(work_site=None).values(
            "work_site"
        ).distinct().count()

        if site_count > 1:
            anomalies.append({
                "worker": worker.name,
                "type": "Multiple Sites",
                "message": f"{worker.name} is marked at multiple work sites today."
            })

        for record in today_records:
            if record.check_in_time and record.check_in_time.hour >= 10:
                anomalies.append({
                    "worker": worker.name,
                    "type": "Late Check-in",
                    "message": f"{worker.name} checked in late at {record.check_in_time}."
                })

            if record.total_hours and record.total_hours < 4:
                anomalies.append({
                    "worker": worker.name,
                    "type": "Low Working Hours",
                    "message": f"{worker.name} worked only {record.total_hours} hours."
                })

        present_days = Attendance.objects.filter(
            worker=worker,
            date__month=today.month,
            date__year=today.year
        ).values("date").distinct().count()

        if present_days < 10:
            anomalies.append({
                "worker": worker.name,
                "type": "Low Monthly Attendance",
                "message": f"{worker.name} has only {present_days} present days this month."
            })

    return Response({
        "date": today,
        "total_anomalies": len(anomalies),
        "anomalies": anomalies
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def voice_attendance(request):
    audio_file = request.FILES.get("audio")
    location = request.data.get("location", "Voice Attendance")
    latitude = request.data.get("latitude", "")
    longitude = request.data.get("longitude", "")

    if not audio_file:
        return Response({"error": "Audio file is required"}, status=400)

    recognizer = sr.Recognizer()

    try:
        with sr.AudioFile(audio_file) as source:
            audio = recognizer.record(source)

        spoken_text = recognizer.recognize_google(audio).lower()

    except Exception as e:
        return Response({
            "error": "Could not understand audio",
            "details": str(e)
        }, status=400)

    workers_data = Worker.objects.filter(is_active=True)
    marked_workers = []

    for worker in workers_data:
        if worker.name.lower() in spoken_text:
            already_marked = Attendance.objects.filter(
                worker=worker,
                date=date.today()
            ).exists()

            if not already_marked:
                Attendance.objects.create(
                    worker=worker,
                    location=location,
                    latitude=latitude,
                    longitude=longitude
                )

            marked_workers.append(worker.name)

    return Response({
        "message": "Voice attendance processed",
        "spoken_text": spoken_text,
        "marked_workers": marked_workers
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ai_chat_assistant(request):
    question = request.data.get("question", "").lower()
    today = date.today()

    if not question:
        return Response({"answer": "Please ask a question."})

    total_workers = Worker.objects.filter(is_active=True).count()

    present_today = Attendance.objects.filter(
        date=today
    ).values("worker").distinct().count()

    absent_today = total_workers - present_today

    unknown_today = UnknownPerson.objects.filter(
        is_registered=False
    ).count()

    if "total worker" in question or "how many worker" in question:
        answer = f"You have {total_workers} active workers."

    elif "present" in question or "attendance today" in question:
        answer = f"{present_today} workers are present today."

    elif "absent" in question:
        answer = f"{absent_today} workers are absent today."

    elif "unknown" in question or "new person" in question:
        answer = f"There are {unknown_today} unknown persons not registered yet."

    elif "salary" in question:
        answer = "Please go to Salary page and select month/year to calculate salary."

    else:
        answer = (
            "I can answer about total workers, present workers, absent workers, "
            "unknown persons, and salary."
        )

    return Response({
        "question": question,
        "answer": answer
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def worker_productivity_score(request, month, year):
    workers_data = Worker.objects.filter(is_active=True)
    result = []

    for worker in workers_data:
        records = Attendance.objects.filter(
            worker=worker,
            date__month=month,
            date__year=year
        )

        present_days = records.count()
        total_hours = sum([record.total_hours or Decimal("0") for record in records])

        attendance_score = 40 if present_days >= 26 else round((present_days / 26) * 40, 2)
        hours_score = 40 if total_hours >= 208 else round((total_hours / 208) * 40, 2)
        punctuality_score = 20

        final_score = attendance_score + hours_score + punctuality_score

        if final_score >= 85:
            rating = "Excellent"
        elif final_score >= 70:
            rating = "Good"
        elif final_score >= 50:
            rating = "Average"
        else:
            rating = "Poor"

        result.append({
            "worker_id": worker.id,
            "worker_name": worker.name,
            "present_days": present_days,
            "total_hours": total_hours,
            "attendance_score": attendance_score,
            "hours_score": hours_score,
            "punctuality_score": punctuality_score,
            "final_score": final_score,
            "rating": rating
        })

    return Response(result)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def monthly_salary(request, month, year):
    department_id = request.GET.get("department_id")

    workers_data = Worker.objects.all()

    if department_id:
        workers_data = workers_data.filter(
            work_site__department_id=department_id
        )

    result = []

    for worker in workers_data:
        records = Attendance.objects.filter(
            worker=worker,
            date__month=month,
            date__year=year
        )

        present_days = records.count()
        total_hours = sum([record.total_hours or Decimal("0") for record in records])

        daily_salary = present_days * worker.daily_wage
        hourly_salary = total_hours * worker.hourly_wage

        if worker.hourly_wage and worker.hourly_wage > 0:
            final_salary = hourly_salary
            salary_type = "Hourly"
        else:
            final_salary = daily_salary
            salary_type = "Daily"

        advance_total = AdvancePayment.objects.filter(
            worker=worker,
            payment_date__month=month,
            payment_date__year=year,
            is_deducted=False
        ).aggregate(total=models.Sum("amount"))["total"] or 0

        net_salary = final_salary - advance_total

        result.append({
            "worker": worker.name,
            "present_days": present_days,
            "total_hours": total_hours,
            "daily_wage": worker.daily_wage,
            "hourly_wage": worker.hourly_wage,
            "salary_type": salary_type,
            "salary": final_salary,
            "advance_deduction": advance_total,
            "net_salary": net_salary,
        })

    return Response(result)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def salary_calculation(request, month, year):
    workers = Worker.objects.filter(is_active=True)
    salary_list = []

    for worker in workers:
        attendance_records = Attendance.objects.filter(
            worker=worker,
            date__month=month,
            date__year=year,
            status="Present"
        )

        present_days = attendance_records.count()

        total_hours = attendance_records.aggregate(
            total=Sum("total_hours")
        )["total"] or Decimal("0")

        daily_salary = Decimal(worker.daily_wage) * present_days
        hourly_salary = Decimal(worker.hourly_wage) * total_hours

        total_salary = daily_salary + hourly_salary

        salary_list.append({
            "worker_id": worker.id,
            "worker_name": worker.name,
            "present_days": present_days,
            "total_hours": total_hours,
            "daily_wage": worker.daily_wage,
            "hourly_wage": worker.hourly_wage,
            "total_salary": total_salary,
        })

    return Response(salary_list)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def organization_salary(request, department_id, month, year):
    workers = Worker.objects.filter(
        is_active=True,
        work_site__department_id=department_id
    )

    salary_list = []

    for worker in workers:
        attendance_records = Attendance.objects.filter(
            worker=worker,
            date__month=month,
            date__year=year,
            status="Present"
        )

        present_days = attendance_records.count()

        total_hours = attendance_records.aggregate(
            total=Sum("total_hours")
        )["total"] or Decimal("0")

        total_salary = (
            Decimal(worker.daily_wage) * present_days
        ) + (
            Decimal(worker.hourly_wage) * total_hours
        )

        salary_list.append({
            "worker_id": worker.id,
            "worker_name": worker.name,
            "present_days": present_days,
            "total_hours": total_hours,
            "daily_wage": worker.daily_wage,
            "hourly_wage": worker.hourly_wage,
            "total_salary": total_salary,
        })

    return Response(salary_list)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def generate_salary_slip(request, worker_id, month, year):
    try:
        worker = Worker.objects.get(id=worker_id)
    except Worker.DoesNotExist:
        return Response({"error": "Worker not found"}, status=404)

    records = Attendance.objects.filter(
        worker=worker,
        date__month=month,
        date__year=year
    )

    present_days = records.count()
    total_hours = sum([record.total_hours or Decimal("0") for record in records])

    if worker.hourly_wage and worker.hourly_wage > 0:
        salary = total_hours * worker.hourly_wage
        salary_type = "Hourly"
    else:
        salary = present_days * worker.daily_wage
        salary_type = "Daily"

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)

    pdf.setTitle("Salary Slip")

    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawString(180, 800, "Salary Slip")

    pdf.setFont("Helvetica", 12)
    pdf.drawString(50, 750, f"Worker Name: {worker.name}")
    pdf.drawString(50, 725, f"Month/Year: {month}/{year}")
    pdf.drawString(50, 700, f"Salary Type: {salary_type}")
    pdf.drawString(50, 675, f"Present Days: {present_days}")
    pdf.drawString(50, 650, f"Total Hours: {total_hours}")
    pdf.drawString(50, 625, f"Daily Wage: {worker.daily_wage}")
    pdf.drawString(50, 600, f"Hourly Wage: {worker.hourly_wage}")

    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, 560, f"Final Salary: Rs. {salary}")

    pdf.setFont("Helvetica", 10)
    pdf.drawString(50, 500, "Generated by Contractor Attendance System")

    pdf.showPage()
    pdf.save()

    buffer.seek(0)

    return FileResponse(
        buffer,
        as_attachment=True,
        filename=f"{worker.name}_salary_slip_{month}_{year}.pdf"
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def advance_payments(request):
    if request.method == "GET":
        data = AdvancePayment.objects.all().order_by("-payment_date")
        serializer = AdvancePaymentSerializer(data, many=True)
        return Response(serializer.data)

    serializer = AdvancePaymentSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Advance payment added successfully"})

    return Response(serializer.errors, status=400)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def smart_reports(request, month, year):
    workers_data = Worker.objects.all()

    report = []
    total_salary_all = Decimal("0")
    total_present_all = 0
    total_hours_all = Decimal("0")

    for worker in workers_data:
        records = Attendance.objects.filter(
            worker=worker,
            date__month=month,
            date__year=year
        )

        present_days = records.filter(status="Present").values("date").distinct().count()
        total_hours = records.aggregate(total=Sum("total_hours"))["total"] or Decimal("0")

        if worker.hourly_wage and worker.hourly_wage > 0:
            gross_salary = Decimal(total_hours) * Decimal(worker.hourly_wage)
            salary_type = "Hourly"
        else:
            gross_salary = Decimal(present_days) * Decimal(worker.daily_wage)
            salary_type = "Daily"

        total_salary_all += gross_salary
        total_present_all += present_days
        total_hours_all += total_hours

        report.append({
            "worker_id": worker.id,
            "worker_name": worker.name,
            "worker_type": worker.worker_type,
            "present_days": present_days,
            "total_hours": total_hours,
            "salary_type": salary_type,
            "daily_wage": worker.daily_wage,
            "hourly_wage": worker.hourly_wage,
            "gross_salary": gross_salary
        })

    return Response({
        "month": month,
        "year": year,
        "summary": {
            "total_workers": workers_data.count(),
            "total_present_days": total_present_all,
            "total_work_hours": total_hours_all,
            "total_salary": total_salary_all
        },
        "workers": report
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def monthly_salary_report_pdf(request, month, year):
    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = (
        f'attachment; filename="salary_report_{month}_{year}.pdf"'
    )

    p = canvas.Canvas(response, pagesize=A4)
    width, height = A4

    y = height - 50

    p.setFont("Helvetica-Bold", 18)
    p.drawCentredString(width / 2, y, "LAKSHMI GANAPATHI ENTERPRISES")

    y -= 25
    p.setFont("Helvetica", 11)
    p.drawCentredString(width / 2, y, "Contractor Workforce Management System")

    y -= 25
    p.setFont("Helvetica-Bold", 13)
    p.drawCentredString(width / 2, y, f"Monthly Salary Report - {month}/{year}")

    y -= 35

    p.setFillColorRGB(0.15, 0.39, 0.92)
    p.rect(35, y - 5, 525, 22, fill=True, stroke=False)

    p.setFillColorRGB(1, 1, 1)
    p.setFont("Helvetica-Bold", 9)

    p.drawString(40, y, "Worker")
    p.drawString(155, y, "Days")
    p.drawString(210, y, "Hours")
    p.drawString(275, y, "Daily")
    p.drawString(345, y, "Hourly")
    p.drawString(430, y, "Salary")

    y -= 25

    workers = Worker.objects.filter(is_active=True)

    grand_total = Decimal("0")
    row_count = 0

    p.setFont("Helvetica", 9)
    p.setFillColorRGB(0, 0, 0)

    for worker in workers:
        attendance_records = Attendance.objects.filter(
            worker=worker,
            date__month=month,
            date__year=year,
            status="Present"
        )

        present_days = attendance_records.count()

        total_hours = attendance_records.aggregate(
            total=Sum("total_hours")
        )["total"] or Decimal("0")

        total_salary = (
            Decimal(worker.daily_wage) * present_days
        ) + (
            Decimal(worker.hourly_wage) * total_hours
        )

        grand_total += total_salary

        if y < 90:
            p.showPage()
            y = height - 50

        if row_count % 2 == 0:
            p.setFillColorRGB(0.96, 0.98, 1)
            p.rect(35, y - 5, 525, 20, fill=True, stroke=False)
            p.setFillColorRGB(0, 0, 0)

        p.drawString(40, y, worker.name[:18])
        p.drawString(155, y, str(present_days))
        p.drawString(210, y, str(total_hours))
        p.drawString(275, y, f"Rs.{worker.daily_wage}")
        p.drawString(345, y, f"Rs.{worker.hourly_wage}")
        p.drawString(430, y, f"Rs.{total_salary}")

        y -= 22
        row_count += 1

    y -= 20

    p.setFont("Helvetica-Bold", 12)
    p.drawString(350, y, "Grand Total:")
    p.drawString(450, y, f"Rs.{grand_total}")

    y -= 60

    p.setFont("Helvetica", 10)
    p.drawString(50, y, "Prepared By: __________________")
    p.drawString(350, y, "Authorized Signature: __________________")

    y -= 35
    p.setFont("Helvetica-Oblique", 9)
    p.drawCentredString(width / 2, y, "This is a system generated salary report.")

    p.showPage()
    p.save()

    return response


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def departments(request):
    if request.method == "GET":
        departments_data = Department.objects.all().order_by("-id")
        serializer = DepartmentSerializer(departments_data, many=True)
        return Response(serializer.data)

    serializer = DepartmentSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Organization added successfully"})

    return Response(serializer.errors, status=400)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def department_detail(request, department_id):
    try:
        department = Department.objects.get(id=department_id)
    except Department.DoesNotExist:
        return Response({"error": "Organization not found"}, status=404)

    if request.method == "GET":
        serializer = DepartmentSerializer(department)
        return Response(serializer.data)

    if request.method == "PUT":
        serializer = DepartmentSerializer(
            department,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Organization updated successfully"})

        return Response(serializer.errors, status=400)

    if request.method == "DELETE":
        force_delete = request.GET.get("force") == "true"

        sites_count = Site.objects.filter(department=department).count()
        work_photos_count = WorkPhoto.objects.filter(
            site__department=department
        ).count()
        attendance_count = Attendance.objects.filter(
            work_site__department_id=department.id
        ).count()

        total_related_data = sites_count + work_photos_count + attendance_count

        if total_related_data > 0 and not force_delete:
            return Response({
                "warning": True,
                "message": "This organization has stored data. Admin permission is required to delete.",
                "sites_count": sites_count,
                "work_photos_count": work_photos_count,
                "attendance_count": attendance_count,
            }, status=409)

        department.delete()

        return Response({"message": "Organization deleted successfully"})


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def sites(request):
    if request.method == "GET":
        department_id = request.GET.get("department_id")
        sites_data = Site.objects.all()

        if department_id:
            sites_data = sites_data.filter(department_id=department_id)

        serializer = SiteSerializer(sites_data, many=True)
        return Response(serializer.data)

    serializer = SiteSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Site added successfully"})

    return Response(serializer.errors, status=400)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def work_photos(request):
    if request.method == "GET":
        site_id = request.GET.get("site_id")
        department_id = request.GET.get("department_id")
        month = request.GET.get("month")
        year = request.GET.get("year")

        photos = WorkPhoto.objects.all().order_by("-uploaded_at")

        if department_id:
            photos = photos.filter(site__department_id=department_id)

        if site_id:
            photos = photos.filter(site_id=site_id)

        if month and year:
            photos = photos.filter(
                bill_month__month=month,
                bill_month__year=year
            )

        serializer = WorkPhotoSerializer(photos, many=True)
        return Response(serializer.data)

    serializer = WorkPhotoSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Work photo uploaded successfully"})

    return Response(serializer.errors, status=400)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def organization_work_photos(request, department_id):
    photos = WorkPhoto.objects.filter(
        site__department_id=department_id
    ).order_by("-uploaded_at")

    serializer = WorkPhotoSerializer(photos, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_work_photos_pdf(request, site_id, month, year):
    site = Site.objects.get(id=site_id)

    photos = WorkPhoto.objects.filter(
        site=site,
        bill_month__month=month,
        bill_month__year=year
    ).order_by("photo_type", "uploaded_at")

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = (
        f'attachment; filename="{site.name}_{month}_{year}_work_photos.pdf"'
    )

    doc = SimpleDocTemplate(response, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("Work Photos Bill Proof Report", styles["Title"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph(f"Department: {site.department.name}", styles["Normal"]))
    story.append(Paragraph(f"Site: {site.name}", styles["Normal"]))
    story.append(Paragraph(f"Location: {site.location}", styles["Normal"]))
    story.append(Paragraph(f"Month: {month}/{year}", styles["Normal"]))
    story.append(Spacer(1, 20))

    for photo in photos:
        story.append(Paragraph(f"Photo Type: {photo.photo_type.upper()}", styles["Heading2"]))

        if photo.description:
            story.append(Paragraph(f"Description: {photo.description}", styles["Normal"]))

        story.append(Paragraph(f"Uploaded At: {photo.uploaded_at}", styles["Normal"]))
        story.append(Spacer(1, 8))

        try:
            img = PDFImage(photo.photo.path, width=5.5 * inch, height=3.5 * inch)
            story.append(img)
            story.append(Spacer(1, 20))
        except Exception:
            story.append(Paragraph("Image not found", styles["Normal"]))

    doc.build(story)
    return response


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def bills_list_create(request):
    if request.method == "GET":
        bills = Bill.objects.all().order_by("-created_at")
        serializer = BillSerializer(bills, many=True)
        return Response(serializer.data)

    serializer = BillSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)

    return Response(serializer.errors, status=400)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def bill_detail(request, pk):
    try:
        bill = Bill.objects.get(id=pk)
    except Bill.DoesNotExist:
        return Response({"error": "Bill not found"}, status=404)

    if request.method == "GET":
        serializer = BillSerializer(bill)
        return Response(serializer.data)

    if request.method in ["PUT", "PATCH"]:
        serializer = BillSerializer(
            bill,
            data=request.data,
            partial=request.method == "PATCH"
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    if request.method == "DELETE":
        bill.delete()
        return Response({"message": "Bill deleted successfully"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def bill_pdf(request, bill_id):
    try:
        bill = Bill.objects.get(id=bill_id)
    except Bill.DoesNotExist:
        return Response({"error": "Bill not found"}, status=404)

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = (
        f'attachment; filename="bill_{bill.id}.pdf"'
    )

    p = canvas.Canvas(response, pagesize=A4)
    width, height = A4

    y = height - 50

    p.setFont("Helvetica-Bold", 18)
    p.drawCentredString(width / 2, y, "LAKSHMI GANAPATHI ENTERPRISES")

    y -= 22
    p.setFont("Helvetica", 10)
    p.drawCentredString(width / 2, y, "Contractor Workforce Management System")

    y -= 28
    p.setFont("Helvetica-Bold", 14)
    p.drawCentredString(width / 2, y, "MONTHLY CONTRACTOR BILL")

    y -= 35

    p.rect(40, y - 120, 515, 120)

    p.setFont("Helvetica-Bold", 11)
    p.drawString(55, y - 25, "Bill Details")

    p.setFont("Helvetica", 10)
    p.drawString(55, y - 50, f"Bill ID: {bill.id}")
    p.drawString(300, y - 50, f"Status: {bill.status}")

    p.drawString(55, y - 75, f"Organization: {bill.department.name}")
    p.drawString(300, y - 75, f"Bill Month: {bill.bill_month}")

    p.drawString(55, y - 100, f"Site: {bill.site.name}")

    y -= 155

    p.setFont("Helvetica-Bold", 12)
    p.drawString(40, y, "Work Description")

    y -= 25
    p.setFont("Helvetica", 10)
    description = bill.work_description or "No description provided"
    p.drawString(50, y, description[:95])

    y -= 45

    p.setFillColorRGB(0.15, 0.39, 0.92)
    p.rect(40, y - 5, 515, 25, fill=True, stroke=False)

    p.setFillColorRGB(1, 1, 1)
    p.setFont("Helvetica-Bold", 10)
    p.drawString(55, y, "Particulars")
    p.drawString(430, y, "Amount")

    y -= 28

    p.setFillColorRGB(0, 0, 0)
    p.setFont("Helvetica", 10)

    rows = [
        ("Salary Amount", bill.salary_amount),
        ("Material Amount", bill.material_amount),
        ("Other Amount", bill.other_amount),
    ]

    for label, amount in rows:
        p.rect(40, y - 5, 515, 24)
        p.drawString(55, y, label)
        p.drawString(430, y, f"Rs. {amount}")
        y -= 24

    p.setFillColorRGB(0.93, 0.96, 1)
    p.rect(40, y - 5, 515, 28, fill=True, stroke=True)

    p.setFillColorRGB(0, 0, 0)
    p.setFont("Helvetica-Bold", 11)
    p.drawString(55, y + 2, "Total Bill Amount")
    p.drawString(430, y + 2, f"Rs. {bill.total_amount}")

    y -= 70

    p.setFont("Helvetica", 10)
    p.drawString(50, y, "Prepared By: __________________")
    p.drawString(330, y, "Authorized Signature: __________________")

    y -= 35
    p.setFont("Helvetica-Oblique", 9)
    p.drawCentredString(width / 2, y, "This is a system generated bill.")

    p.showPage()
    p.save()

    return response

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def offline_attendance(request):
    record_type = request.data.get("type", "worker")

    if record_type == "group_photo":
        return upload_group_photo(request)

    worker_id = request.data.get("worker")
    attendance_date = request.data.get("date") or date.today()
    check_in = request.data.get("check_in") or request.data.get("time")
    latitude = request.data.get("latitude", "")
    longitude = request.data.get("longitude", "")
    location = request.data.get("location", "")
    status_value = request.data.get("status", "Present")
    work_site_id = request.data.get("work_site")

    if not worker_id:
        return Response(
            {"error": "Worker id is required for worker attendance"},
            status=400
        )

    try:
        worker = Worker.objects.get(id=worker_id)
    except Worker.DoesNotExist:
        return Response({"error": "Worker not found"}, status=404)

    work_site = None

    if work_site_id:
        work_site = WorkSite.objects.filter(id=work_site_id).first()

    defaults = {
        "work_site": work_site,
        "latitude": latitude,
        "longitude": longitude,
        "location": location,
        "status": status_value,
    }

    attendance, created = Attendance.objects.get_or_create(
        worker=worker,
        date=attendance_date,
        defaults=defaults,
    )

    if check_in and created:
        try:
            attendance.check_in_time = datetime.strptime(
                check_in.split()[0],
                "%H:%M:%S"
            ).time()

            attendance.save(update_fields=["check_in_time"])
        except Exception:
            pass

    if not created:
        return Response({"message": "Attendance already exists"})

    return Response({"message": "Offline attendance synced"}, status=201)
    
class OfflineAttendanceView(APIView):

    def post(self, request):
        serializer = OfflineAttendanceSerializer(
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Attendance synced"},
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

def worker_id_card_pdf(request, worker_id):
    worker = Worker.objects.get(id=worker_id)

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="worker_{worker.id}_id_card.pdf"'

    p = canvas.Canvas(response, pagesize=A4)

    card_x = 55 * mm
    card_y = 140 * mm
    card_w = 100 * mm
    card_h = 60 * mm

    # Card background
    p.setFillColor(colors.white)
    p.roundRect(card_x, card_y, card_w, card_h, 8, fill=1)

    # Header
    p.setFillColor(colors.HexColor("#1e3a8a"))
    p.roundRect(card_x, card_y + card_h - 15 * mm, card_w, 15 * mm, 8, fill=1)

    p.setFillColor(colors.white)
    p.setFont("Helvetica-Bold", 12)
    p.drawCentredString(card_x + card_w / 2, card_y + card_h - 10 * mm, "WORKER ID CARD")

    # Company name
    p.setFillColor(colors.black)
    p.setFont("Helvetica-Bold", 10)
    p.drawCentredString(card_x + card_w / 2, card_y + card_h - 22 * mm, "LAKSHMI GANAPATHI ENTERPRISES")

    # Photo box
    photo_x = card_x + 5 * mm
    photo_y = card_y + 15 * mm
    photo_w = 25 * mm
    photo_h = 30 * mm

    p.setStrokeColor(colors.gray)
    p.rect(photo_x, photo_y, photo_w, photo_h)

    if worker.face_image:
        try:
            p.drawImage(
                worker.face_image.path,
                photo_x,
                photo_y,
                width=photo_w,
                height=photo_h,
                preserveAspectRatio=True,
                mask="auto",
            )
        except Exception:
            p.setFont("Helvetica", 7)
            p.drawCentredString(photo_x + photo_w / 2, photo_y + 14 * mm, "No Photo")

    # Worker details
    text_x = card_x + 35 * mm
    text_y = card_y + 42 * mm

    p.setFont("Helvetica-Bold", 9)
    p.drawString(text_x, text_y, f"Name: {worker.name}")

    p.setFont("Helvetica", 8)
    p.drawString(text_x, text_y - 7 * mm, f"Worker ID: {worker.id}")

    if hasattr(worker, "phone"):
        p.drawString(text_x, text_y - 14 * mm, f"Phone: {worker.phone}")

    if hasattr(worker, "designation"):
        p.drawString(text_x, text_y - 21 * mm, f"Role: {worker.designation}")

    if hasattr(worker, "daily_wage"):
        p.drawString(text_x, text_y - 28 * mm, f"Daily Wage: Rs. {worker.daily_wage}")

    # Footer
    p.setFillColor(colors.HexColor("#1e3a8a"))
    p.rect(card_x, card_y, card_w, 8 * mm, fill=1)

    p.setFillColor(colors.white)
    p.setFont("Helvetica-Bold", 7)
    p.drawCentredString(card_x + card_w / 2, card_y + 3 * mm, "Authorized Contractor")

    p.showPage()
    p.save()

    return response


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def worker_checkin(request):
    worker_id = request.data.get("worker_id")

    try:
        worker = Worker.objects.get(id=worker_id)
    except Worker.DoesNotExist:
        return Response({"error": "Worker not found"}, status=404)

    attendance, created = Attendance.objects.get_or_create(
        worker=worker,
        date=date.today(),
        defaults={
            "status": "Present",
            "check_in_time": datetime.now().time(),
        }
    )

    if not created:
        return Response({"message": "Already checked in today"})

    return Response({"message": "Check-in successful"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def worker_checkout(request):
    worker_id = request.data.get("worker_id")

    try:
        attendance = Attendance.objects.get(
            worker_id=worker_id,
            date=date.today()
        )
    except Attendance.DoesNotExist:
        return Response({"error": "Check-in first"}, status=400)

    attendance.check_out_time = datetime.now().time()

    if attendance.check_in_time:
        check_in_dt = datetime.combine(attendance.date, attendance.check_in_time)
        check_out_dt = datetime.combine(attendance.date, attendance.check_out_time)
        attendance.total_hours = Decimal(
            (check_out_dt - check_in_dt).total_seconds() / 3600
        ).quantize(Decimal("0.01"))

    attendance.save()

    return Response({"message": "Check-out successful"})

def get_all_worker_encodings():
    known_workers = []
    known_encodings = []

    for worker in Worker.objects.filter(is_active=True):
        if worker.face_encoding:
            known_workers.append(worker)
            known_encodings.append(np.array(worker.face_encoding))

        learned_faces = WorkerFaceEncoding.objects.filter(worker=worker)

        for face in learned_faces:
            known_workers.append(worker)
            known_encodings.append(np.array(face.face_encoding))

    return known_workers, known_encodings

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def learn_unknown_face(request):
    unknown_id = request.data.get("unknown_id")
    worker_id = request.data.get("worker_id")

    if not unknown_id or not worker_id:
        return Response(
            {"error": "unknown_id and worker_id are required"},
            status=400
        )

    try:
        unknown = UnknownPerson.objects.get(id=unknown_id)
    except UnknownPerson.DoesNotExist:
        return Response({"error": "Unknown person not found"}, status=404)

    try:
        worker = Worker.objects.get(id=worker_id)
    except Worker.DoesNotExist:
        return Response({"error": "Worker not found"}, status=404)

    image = face_recognition.load_image_file(unknown.image.path)
    face_locations = face_recognition.face_locations(image)

    if len(face_locations) == 0:
        return Response({"error": "No face found in unknown image"}, status=400)

    face_encodings = face_recognition.face_encodings(image, face_locations)

    if len(face_encings := face_encodings) == 0:
        return Response({"error": "Face encoding failed"}, status=400)

    encoding = face_encings[0]

    WorkerFaceEncoding.objects.create(
        worker=worker,
        face_image=unknown.image,
        face_encoding=encoding.tolist(),
        learned_from_unknown=unknown
    )

    WorkerFaceHistory.objects.create(
        worker=worker,
        face_image=unknown.image,
        location=unknown.location
    )

    unknown.is_registered = True
    unknown.save()

    return Response({
        "message": "AI learned this face successfully",
        "worker_id": worker.id,
        "worker_name": worker.name
    })