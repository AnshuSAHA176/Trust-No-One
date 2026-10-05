from django.db import models
import uuid
from config import settings


class Game(models.Model):

    class Phase(models.TextChoices):
        SETUP = "setup", "Setup"
        INVESTIGATION = "investigation", "Investigation"
        VOTING = "voting", "Voting"
        ELIMINATION = "elimination", "Elimination"
        RESULT = "result", "Result"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"

        RUNNING = "running", "Running"

        FINISHED = "finished", "Finished"

    id = models.UUIDField(
        primary_key=True, unique=True, editable=False, default=uuid.uuid4
    )

    scenario = models.TextField()

    phase = models.CharField(choices=Phase.choices, default=Phase.SETUP)

    status = models.CharField(choices=Status.choices, default=Status.PENDING)

    created_at = models.DateTimeField(auto_now_add=True)

    started_at = models.DateTimeField(null=True)

    ended_at = models.DateTimeField(null=True)

    def __str__(self):
        return f"{self.scenario}"


class Player(models.Model):

    class Role(models.TextChoices):
        GADDAR = "gaddar", "Gaddar"
        SAATHI = "patner", "Patner"

    id = models.UUIDField(
        primary_key=True, unique=True, default=uuid.uuid4, editable=False
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True
    )

    game = models.ForeignKey("Game", on_delete=models.CASCADE, related_name="players")
    name = models.CharField(max_length=200)
    is_human = models.BooleanField(default=False)
    role = models.CharField(max_length=20, choices=Role.choices, null=True, blank=True)
    personality = models.CharField(max_length=400, blank=True, default="")
    private_information = models.TextField(blank=True, default="")
    is_alive = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name}"
