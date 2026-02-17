from django.db import models
from django.contrib.auth.models import AbstractUser

# Django ORM models below define the data schema.
# Django generates SQL (CREATE TABLE, ALTER TABLE) from these models via migrations.
# Run: python manage.py makemigrations -> creates migration files (SQL plan)
# Run: python manage.py migrate -> applies generated SQL to MySQL (findit_db)

class User(AbstractUser):
    # Extends the built-in Django user with app-specific fields.
    # Stored in MySQL table 'users' (see Meta.db_table).
    
    phone = models.CharField(max_length=50, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    avatar_path = models.CharField(max_length=255, blank=True, null=True)
    verified = models.BooleanField(default=False)
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    profile_visibility = models.CharField(max_length=50, default='members')
    show_phone = models.BooleanField(default=False)
    
    # We don't need join_date or last_login as AbstractUser provides date_joined and last_login.

    class Meta:
        db_table = 'users' # Explicit table name mapping in MySQL

class Category(models.Model):
    # Item category reference data
    name = models.CharField(max_length=255, unique=True)
    emoji = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    item_count = models.IntegerField(default=0)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

class Item(models.Model):
    # Core item record (lost/found/recovered)
    STATUS_CHOICES = [
        ('lost', 'Lost'),
        ('found', 'Found'),
        ('recovered', 'Recovered'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='items')
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES)
    category = models.CharField(max_length=50) # Could be ForeignKey to Category
    location = models.CharField(max_length=255)
    date = models.CharField(max_length=50) # String to match legacy format
    time = models.CharField(max_length=50, blank=True, null=True)
    posted_by = models.CharField(max_length=255)
    contact = models.CharField(max_length=255)
    reward = models.CharField(max_length=255, blank=True, null=True)
    additional_info = models.TextField(blank=True, null=True)
    image_path = models.CharField(max_length=255, blank=True, null=True)
    current_location = models.CharField(max_length=255, blank=True, null=True)
    date_reported = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    views = models.IntegerField(default=0)

    class Meta:
        db_table = 'items' # Explicit table name

    def __str__(self):
        return self.title

class Claim(models.Model):
    # Ownership claim made by a user for an item
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='claims')
    claimant_name = models.CharField(max_length=255)
    claimant_email = models.CharField(max_length=255)
    claimant_phone = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField()
    verification_details = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='pending', choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'claims'

class Message(models.Model):
    # Direct message related to an item
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    sender_name = models.CharField(max_length=255)
    sender_email = models.CharField(max_length=255)
    receiver_email = models.CharField(max_length=255)
    subject = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'

class Notification(models.Model):
    # In-app notification for user actions and updates
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    item = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True)
    type = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    message = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'

class ActivityLog(models.Model):
    # Audit log of actions performed in the system
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    item = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    details = models.TextField(blank=True, null=True)
    ip_address = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_log'
