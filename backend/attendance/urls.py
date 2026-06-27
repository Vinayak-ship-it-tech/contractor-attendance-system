from django.urls import path
from . import views
from .views import offline_attendance
from .views import OfflineAttendanceView

urlpatterns = [
    path("login/", views.admin_login),

    # Workers
    path("workers/", views.workers),
    path("workers/<int:worker_id>/", views.worker_detail),
    path("workers/<int:worker_id>/toggle-status/", views.toggle_worker_status),
    path("workers/<int:worker_id>/face-history/", views.worker_face_history),

    # Attendance
    path("attendance/", views.attendance_list),
    path("attendance/<int:attendance_id>/correct/", views.correct_attendance),
    path("attendance/site/<int:site_id>/", views.site_attendance),
    path("checkout/<int:attendance_id>/", views.checkout_worker),
    path("offline-attendance/", offline_attendance),
    path("offline-attendance-sync/", OfflineAttendanceView.as_view()),

    # Group photo / Unknown persons
    path("upload-group-photo/", views.upload_group_photo),
    path("unknown-persons/", views.unknown_persons),
    path("register-unknown-worker/", views.register_unknown_worker),
    path("learn-unknown-face/", views.learn_unknown_face),

    # Dashboard / analytics
    path("dashboard-summary/", views.dashboard_summary),
    path("live-worker-count/", views.live_worker_count),
    path("attendance-heatmap/", views.attendance_heatmap),
    path("group-photo-comparison/", views.group_photo_comparison),
    path("productivity-score/<int:month>/<int:year>/", views.worker_productivity_score),
    path("attendance-anomalies/", views.attendance_anomaly_detection),
    path("smart-reports/<int:month>/<int:year>/", views.smart_reports),
    path("ai-chat/", views.ai_chat_assistant),

    # Salary
    path("salary/<int:month>/<int:year>/", views.salary_calculation),
    path("salary/organization/<int:department_id>/<int:month>/<int:year>/", views.organization_salary),
    path("salary-slip/<int:worker_id>/<int:month>/<int:year>/", views.generate_salary_slip),
    path("advance-payments/", views.advance_payments),

    # Reports
    path("reports/monthly/<int:month>/<int:year>/", views.monthly_salary_report_pdf),

    # Departments / organizations
    path("departments/", views.departments),
    path("departments/<int:department_id>/", views.department_detail),

    # Sites
    path("sites/", views.sites),
    path("work-sites/", views.work_sites),
    path("work-sites/<int:site_id>/", views.work_site_detail),

    # Work photos
    path("work-photos/", views.work_photos),
    path("work-photos/organization/<int:department_id>/", views.organization_work_photos),
    path("work-photos/pdf/<int:site_id>/<int:month>/<int:year>/", views.download_work_photos_pdf),

    # Bills
    path("bills/", views.bills_list_create),
    path("bills/<int:pk>/", views.bill_detail),
    path("bills/<int:bill_id>/pdf/", views.bill_pdf),

    # Voice attendance
    path("voice-attendance/", views.voice_attendance),
    path("workers/<int:worker_id>/id-card/", views.worker_id_card_pdf, name="worker-id-card"),

    path("worker-checkin/", views.worker_checkin),
    path("worker-checkout/", views.worker_checkout),
   
    
]