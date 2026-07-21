from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

User = get_user_model()

class Command(BaseCommand):
    help = "Create admin user if it does not exist"

    def handle(self, *args, **kwargs):
        username = os.getenv("ADMIN_USERNAME")
        email = os.getenv("ADMIN_EMAIL")
        password = os.getenv("ADMIN_PASSWORD")

        if not username or not email or not password:
            self.stdout.write(self.style.ERROR("Admin environment variables are missing."))
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.SUCCESS("Admin user already exists."))
        else:
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(self.style.SUCCESS("Admin user created successfully."))