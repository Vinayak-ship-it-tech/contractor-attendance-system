import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = "Create admin user if it does not exist"

    def handle(self, *args, **kwargs):
        username = os.environ.get("DJANGO_ADMIN_USERNAME")
        email = os.environ.get("DJANGO_ADMIN_EMAIL")
        password = os.environ.get("DJANGO_ADMIN_PASSWORD")

        if not username or not password:
            self.stdout.write("Admin username/password not provided")
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write("Admin user already exists")
            return

        User.objects.create_superuser(
            username=username,
            email=email or "",
            password=password
        )

        self.stdout.write("Admin user created successfully")