from django.urls import path

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
]