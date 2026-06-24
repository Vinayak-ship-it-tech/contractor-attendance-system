from rest_framework import serializers
from .models import Worker, Attendance, UnknownPerson, Salary
from .models import WorkerFaceHistory
from .models import WorkSite , Bill
from .models import GroupPhotoUpload
from .models import AdvancePayment
from .models import Department, Site, WorkPhoto
from .models import OfflineAttendance



class WorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worker
        fields = '__all__'


class AttendanceSerializer(serializers.ModelSerializer):
    worker_name = serializers.CharField(source='worker.name', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'


class UnknownPersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnknownPerson
        fields = '__all__'


class SalarySerializer(serializers.ModelSerializer):
    worker_name = serializers.CharField(source='worker.name', read_only=True)

    class Meta:
        model = Salary
        fields = '__all__'


class WorkerFaceHistorySerializer(serializers.ModelSerializer):
    worker_name = serializers.CharField(source='worker.name', read_only=True)

    class Meta:
        model = WorkerFaceHistory
        fields = '__all__'
        

class WorkSiteSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(
        source='department.name',
        read_only=True
    )

    class Meta:
        model = WorkSite
        fields = '__all__'


class GroupPhotoUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupPhotoUpload
        fields = '__all__'


class AdvancePaymentSerializer(serializers.ModelSerializer):
    worker_name = serializers.CharField(source='worker.name', read_only=True)

    class Meta:
        model = AdvancePayment
        fields = '__all__'


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"


class SiteSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = Site
        fields = "__all__"


class WorkPhotoSerializer(serializers.ModelSerializer):
    site_name = serializers.CharField(source="site.name", read_only=True)
    department_name = serializers.CharField(
        source="site.department.name",
        read_only=True
    )

    class Meta:
        model = WorkPhoto
        fields = "__all__"

class BillSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(
        source="department.name",
        read_only=True
    )

    site_name = serializers.CharField(
        source="site.name",
        read_only=True
    )

    class Meta:
        model = Bill
        fields = "__all__"


class OfflineAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfflineAttendance
        fields = "__all__"