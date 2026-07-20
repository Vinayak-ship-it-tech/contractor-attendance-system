from django.urls import path

from .views import NotificationListAPIView
from .views import NotificationReadAPIView
from .views import NotificationUnreadCountAPIView
from .views import TenderDashboardAPIView

from .views import (
    TenderListAPIView,
    TenderDetailAPIView,
    OrganizationListAPIView,
    DepartmentListAPIView,
    RecommendedTenderAPIView,
)

urlpatterns = [
    path("", TenderListAPIView.as_view()),

    path("<int:pk>/", TenderDetailAPIView.as_view()),

    path(
        "organizations/",
        OrganizationListAPIView.as_view()
    ),

    path(
        "departments/",
        DepartmentListAPIView.as_view()
    ),

    path(
        "recommended/",
        RecommendedTenderAPIView.as_view()
    ),

    path(
        "notifications/",
        NotificationListAPIView.as_view(),
        name="notification-list",
    ),

    path(
        "notifications/<int:pk>/read/",
        NotificationReadAPIView.as_view(),
        name="notification-read",
    ),

    path(
        "notifications/unread-count/",
        NotificationUnreadCountAPIView.as_view(),
        name="notification-unread-count",
    ),

    path(
        "dashboard/",
        TenderDashboardAPIView.as_view(),
        name="tender-dashboard",
    ),
]