import json
import os
from datetime import datetime
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.hashers import make_password
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from .models import User, Item, Claim, Notification, ActivityLog

# --- Page Views ---
# Render HTML templates for the website pages.
# These views do not change the database; they only display content.

def index(request):
    return render(request, 'index.html')

def login_page(request):
    return render(request, 'login.html')

def register_page(request):
    return render(request, 'register.html')

def browse(request):
    return render(request, 'browse.html')

def report_lost(request):
    return render(request, 'report-lost.html')

def report_found(request):
    return render(request, 'report-found.html')

def item_detail(request):
    return render(request, 'item-detail.html')

def profile(request):
    return render(request, 'profile.html')

def my_items(request):
    return render(request, 'my-items.html')

def edit_profile(request):
    return render(request, 'edit-profile.html')

def about(request):
    return render(request, 'about.html')

# --- API Views ---
# JSON endpoints called by frontend JavaScript.
# These read/write data in MySQL via Django's ORM (models.py).

@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            if not email or not password:
                return JsonResponse({'success': False, 'error': 'Email and password are required'}, status=400)

            # Authenticate using Django's auth system
            # Note: We use 'username' as the unique identifier in Django default auth, 
            # but our User model might use email. 
            # Let's try to find the user by email first.
            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

            if user is not None:
                login(request, user)
                
                # Update last login is handled by Django automatically
                
                return JsonResponse({
                    'success': True,
                    'user': {
                        'id': user.id,
                        'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                        'email': user.email,
                        'phone': user.phone,
                        'location': user.location,
                        'join_date': user.date_joined.isoformat()
                    }
                })
            else:
                return JsonResponse({'success': False, 'error': 'Invalid email or password'}, status=401)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            email = data.get('email')
            password = data.get('password')
            phone = data.get('phone')

            if not name or not email or not password:
                return JsonResponse({'success': False, 'error': 'Name, email, and password are required'}, status=400)

            if User.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'error': 'Email already registered'}, status=409)

            # Create user
            # Split name into first and last if possible
            parts = name.split(' ', 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ''
            
            # Use email as username since it must be unique
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                phone=phone
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Registration successful! Please log in.',
                'user_id': user.id
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

def get_category_emoji(category):
    emojis = {
        'electronics': '📱',
        'accessories': '👓',
        'bags': '🎒',
        'documents': '🆔',
        'jewelry': '💍',
        'clothing': '👕',
        'other': '📦'
    }
    return emojis.get(category, '📦')

@csrf_exempt
def api_items(request):
    if request.method == 'GET':
        try:
            status = request.GET.get('status')
            category = request.GET.get('category')
            search = request.GET.get('search')
            user_id = request.GET.get('user_id')

            items = Item.objects.all().order_by('-date_reported')

            if status:
                items = items.filter(status=status)
            if category:
                items = items.filter(category=category)
            if user_id:
                items = items.filter(user_id=user_id)
            if search:
                items = items.filter(title__icontains=search) | items.filter(description__icontains=search)

            items_list = []
            for item in items:
                items_list.append({
                    'id': item.id,
                    'title': item.title,
                    'description': item.description,
                    'status': item.status,
                    'category': item.category,
                    'location': item.location,
                    'date': item.date,
                    'time': item.time,
                    'posted_by': item.posted_by,
                    'contact': item.contact,
                    'reward': item.reward,
                    'image_path': item.image_path,
                    'image': get_category_emoji(item.category),
                    'views': item.views,
                    'date_reported': item.date_reported.isoformat()
                })

            return JsonResponse({
                'success': True,
                'items': items_list,
                'count': len(items_list)
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_item_detail(request, item_id):
    if request.method == 'GET':
        try:
            item = get_object_or_404(Item, id=item_id)
            
            # Increment view count
            item.views += 1
            item.save()

            item_dict = {
                'id': item.id,
                'title': item.title,
                'description': item.description,
                'status': item.status,
                'category': item.category,
                'location': item.location,
                'date': item.date,
                'time': item.time,
                'posted_by': item.posted_by,
                'contact': item.contact,
                'reward': item.reward,
                'additional_info': item.additional_info,
                'image_path': item.image_path,
                'image': get_category_emoji(item.category),
                'views': item.views,
                'user_id': item.user.id if item.user else None
            }

            return JsonResponse({
                'success': True,
                'item': item_dict
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
            
    elif request.method == 'DELETE':
        try:
            item = get_object_or_404(Item, id=item_id)
            item.delete()
            return JsonResponse({'success': True, 'message': 'Item deleted successfully'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_report_lost(request):
    if request.method == 'POST':
        try:
            # Handle multipart/form-data
            data = request.POST
            
            required_fields = ['itemName', 'category', 'description', 'location', 'dateLost', 'contactInfo']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'success': False, 'error': f'Missing required field: {field}'}, status=400)

            image_path = None
            if 'itemImage' in request.FILES:
                image = request.FILES['itemImage']
                # Save image
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"{timestamp}_{image.name}"
                # Save to static/uploads
                # Ensure directory exists
                upload_dir = os.path.join(settings.BASE_DIR, 'findit_django', 'static', 'uploads')
                os.makedirs(upload_dir, exist_ok=True)
                
                with open(os.path.join(upload_dir, filename), 'wb+') as destination:
                    for chunk in image.chunks():
                        destination.write(chunk)
                image_path = filename

            user_id = data.get('user_id')
            user = None
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    pass

            item = Item.objects.create(
                user=user,
                title=data['itemName'],
                description=data['description'],
                status='lost',
                category=data['category'],
                location=data['location'],
                date=data['dateLost'],
                time=data.get('timeLost', ''),
                posted_by=data['contactInfo'].split('@')[0], # Simplified
                contact=data['contactInfo'],
                reward=data.get('reward', ''),
                additional_info=data.get('additionalInfo', ''),
                image_path=image_path
            )

            return JsonResponse({
                'success': True,
                'message': 'Lost item reported successfully!',
                'item_id': item.id
            })

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_report_found(request):
    if request.method == 'POST':
        try:
            data = request.POST
            
            required_fields = ['itemName', 'category', 'description', 'location', 'dateFound', 'contactInfo']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'success': False, 'error': f'Missing required field: {field}'}, status=400)

            image_path = None
            if 'itemImage' in request.FILES:
                image = request.FILES['itemImage']
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"{timestamp}_{image.name}"
                upload_dir = os.path.join(settings.BASE_DIR, 'findit_django', 'static', 'uploads')
                os.makedirs(upload_dir, exist_ok=True)
                
                with open(os.path.join(upload_dir, filename), 'wb+') as destination:
                    for chunk in image.chunks():
                        destination.write(chunk)
                image_path = filename

            user_id = data.get('user_id')
            user = None
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    pass

            item = Item.objects.create(
                user=user,
                title=data['itemName'],
                description=data['description'],
                status='found',
                category=data['category'],
                location=data['location'],
                date=data['dateFound'],
                time=data.get('timeFound', ''),
                posted_by=data['contactInfo'].split('@')[0],
                contact=data['contactInfo'],
                additional_info=data.get('additionalInfo', ''),
                current_location=data.get('currentLocation', ''),
                image_path=image_path
            )

            return JsonResponse({
                'success': True,
                'message': 'Found item reported successfully!',
                'item_id': item.id
            })

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_claim(request, item_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            item = get_object_or_404(Item, id=item_id)
            
            claim = Claim.objects.create(
                item=item,
                claimant_name=data.get('name', 'Anonymous'),
                claimant_email=data.get('email', ''),
                claimant_phone=data.get('phone', ''),
                description=data.get('description', ''),
                verification_details=data.get('verification', '')
            )
            
            # Create notification for owner
            if item.user:
                Notification.objects.create(
                    user=item.user,
                    item=item,
                    type='claim',
                    title='New Claim Received',
                    message=f"{data.get('name', 'Someone')} has claimed your item: {item.title}"
                )

            return JsonResponse({
                'success': True,
                'message': 'Claim submitted successfully!',
                'claim_id': claim.id
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_recover(request, item_id):
    if request.method == 'POST':
        try:
            item = get_object_or_404(Item, id=item_id)
            item.status = 'recovered'
            item.save()
            return JsonResponse({'success': True, 'message': 'Item marked as recovered'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_user_stats(request, user_id):
    if request.method == 'GET':
        try:
            user = get_object_or_404(User, id=user_id)
            
            total = Item.objects.filter(user=user).count()
            lost = Item.objects.filter(user=user, status='lost').count()
            found = Item.objects.filter(user=user, status='found').count()
            recovered = Item.objects.filter(user=user, status='recovered').count()
            
            return JsonResponse({
                'success': True,
                'stats': {
                    'total': total,
                    'lost': lost,
                    'found': found,
                    'recovered': recovered
                }
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_update_profile(request, user_id):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            user = get_object_or_404(User, id=user_id)
            
            user.first_name = data.get('name', user.first_name) # Assuming name is mapped to first_name
            user.phone = data.get('phone', user.phone)
            user.location = data.get('location', user.location)
            user.bio = data.get('bio', user.bio)
            
            notifications = data.get('notifications', {})
            user.email_notifications = notifications.get('email', user.email_notifications)
            user.sms_notifications = notifications.get('sms', user.sms_notifications)
            
            privacy = data.get('privacy', {})
            user.profile_visibility = privacy.get('visibility', user.profile_visibility)
            user.show_phone = privacy.get('showPhone', user.show_phone)
            
            user.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Profile updated successfully'
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
