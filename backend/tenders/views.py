from django.db.models import Q
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Tender, Organization, Department
from .serializers import (
    TenderSerializer,
    OrganizationSerializer,
    DepartmentSerializer
)


class TenderListAPIView(generics.ListAPIView):
    serializer_class = TenderSerializer

    def get_queryset(self):
        queryset = Tender.objects.select_related(
            "organization",
            "department"
        )

        organization = self.request.GET.get("organization")
        department = self.request.GET.get("department")
        status = self.request.GET.get("status")
        search = self.request.GET.get("search")

        if organization:
            queryset = queryset.filter(
                organization__name__icontains=organization
            )

        if department:
            queryset = queryset.filter(
                department__name__icontains=department
            )

        if status:
            queryset = queryset.filter(status=status)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(tender_id__icontains=search)
            )

        return queryset.order_by("-published_date")


class TenderDetailAPIView(generics.RetrieveAPIView):
    queryset = Tender.objects.all()
    serializer_class = TenderSerializer


class OrganizationListAPIView(generics.ListAPIView):
    queryset = Organization.objects.all().order_by("name")
    serializer_class = OrganizationSerializer


class DepartmentListAPIView(generics.ListAPIView):
    queryset = Department.objects.all().order_by("name")
    serializer_class = DepartmentSerializer


class RecommendedTenderAPIView(APIView):

    def get(self, request):

        queryset = Tender.objects.all()

        keywords = [
            "horticulture",
            "garden",
            "civil",
            "road",
            "house keeping",
            "housekeeping",
            "sanitation"
        ]

        recommended = []

        for tender in queryset:

            score = 0

            title = tender.title.lower()

            for keyword in keywords:

                if keyword in title:
                    score += 10

            recommended.append({
                "score": score,
                "tender": TenderSerializer(tender).data
            })

        recommended.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        return Response(recommended[:20])