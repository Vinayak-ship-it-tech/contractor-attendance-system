from django.db.models import Q

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .pagination import TenderPagination

from .models import (
    Tender,
    Organization,
    Department,
    TenderNotification,
)

from .serializers import (
    TenderSerializer,
    OrganizationSerializer,
    DepartmentSerializer,
    TenderNotificationSerializer,
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

    queryset = Tender.objects.select_related(
        "organization",
        "department"
    )

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
    
class NotificationListAPIView(generics.ListAPIView):

    queryset = TenderNotification.objects.select_related(
        "tender",
        "tender__organization",
        "tender__department",
    )

    serializer_class = TenderNotificationSerializer

class NotificationReadAPIView(APIView):

    def post(self, request, pk):

        try:
            notification = TenderNotification.objects.get(pk=pk)

        except TenderNotification.DoesNotExist:
            return Response(
                {"error": "Notification not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        notification.is_read = True
        notification.save(update_fields=["is_read"])

        return Response(
            {
                "success": True,
                "message": "Notification marked as read."
            }
        )
    
class NotificationUnreadCountAPIView(APIView):

    def get(self, request):

        unread = TenderNotification.objects.filter(
            is_read=False
        ).count()

        return Response({
            "unread_count": unread
        })
    
class TenderDashboardAPIView(APIView):

    def get(self, request):

        return Response({
            "total_tenders": Tender.objects.count(),
            "organizations": Organization.objects.count(),
            "departments": Department.objects.count(),
            "unread_notifications":
                TenderNotification.objects.filter(
                    is_read=False
                ).count(),
        })
    
class TenderListAPIView(generics.ListAPIView):

    serializer_class = TenderSerializer
    pagination_class = TenderPagination

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