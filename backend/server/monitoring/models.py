from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Server(models.Model):

    ENVIRONMENT_CHOICES = [
        ('Development', 'Development'),
        ('Staging', 'Staging'),
        ('Production', 'Production'),
    ]

    name = models.CharField(max_length=100)

    host = models.CharField(max_length=255)

    port = models.PositiveIntegerField(
        default=22,
        validators=[
            MinValueValidator(1),
            MaxValueValidator(65535)
        ]
    )

    environment = models.CharField(
        max_length=20,
        choices=ENVIRONMENT_CHOICES,
        default='Development'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name