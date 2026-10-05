from django.db import models
from django.contrib.auth.base_user import AbstractBaseUser
import uuid
from .custom_user_manager import CustomUserManager

class User(AbstractBaseUser):

    objects = CustomUserManager()

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    email = models.EmailField(unique= True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'email:- {self.email}'