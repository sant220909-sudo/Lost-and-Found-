from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from core import views

# URL routing map:
# - Page Routes: render templates for user-facing pages
# - API Routes: JSON endpoints consumed by frontend JS
urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Page Routes
    path('', views.index, name='index'),
    path('index.html', views.index, name='index_html'),
    path('login.html', views.login_page, name='login'),
    path('register.html', views.register_page, name='register'),
    path('browse.html', views.browse, name='browse'),
    path('report-lost.html', views.report_lost, name='report_lost'),
    path('report-found.html', views.report_found, name='report_found'),
    path('item-detail.html', views.item_detail, name='item_detail'),
    path('profile.html', views.profile, name='profile'),
    path('my-items.html', views.my_items, name='my_items'),
    path('edit-profile.html', views.edit_profile, name='edit_profile'),
    path('about.html', views.about, name='about'),

    # API Routes
    path('api/login', views.api_login, name='api_login'),
    path('api/register', views.api_register, name='api_register'),
    path('api/items', views.api_items, name='api_items'),
    path('api/items/<int:item_id>', views.api_item_detail, name='api_item_detail'),
    path('api/report-lost', views.api_report_lost, name='api_report_lost'),
    path('api/report-found', views.api_report_found, name='api_report_found'),
    path('api/items/<int:item_id>/claim', views.api_claim, name='api_claim'),
    path('api/items/<int:item_id>/recover', views.api_recover, name='api_recover'),
    path('api/users/<int:user_id>/stats', views.api_user_stats, name='api_user_stats'),
    path('api/users/<int:user_id>', views.api_update_profile, name='api_update_profile'),

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Serve uploaded files in development
if settings.DEBUG:
    urlpatterns += static('/uploads/', document_root=settings.BASE_DIR / 'findit_django/static/uploads')
