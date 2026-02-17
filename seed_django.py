import os
import django
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'findit_django.settings')
django.setup()

from core.models import User, Item, Category

def seed():
    # Insert reference categories and demo records using Django ORM.
    # This does not define SQL schema; it only writes rows into existing tables.
    categories = [
        ('electronics', '📱', 'Phones, laptops, tablets, and other electronic devices'),
        ('accessories', '👓', 'Glasses, watches, jewelry, and personal accessories'),
        ('bags', '🎒', 'Backpacks, handbags, luggage, and wallets'),
        ('documents', '🆔', 'IDs, passports, cards, and important papers'),
        ('jewelry', '💍', 'Rings, necklaces, bracelets, and valuable jewelry'),
        ('clothing', '👕', 'Jackets, shoes, hats, and clothing items'),
        ('other', '📦', 'Other items not listed in categories')
    ]
    
    print("Creating categories...")
    for name, emoji, desc in categories:
        Category.objects.get_or_create(name=name, defaults={'emoji': emoji, 'description': desc})

    # Create Sample User
    if not User.objects.filter(email='john@example.com').exists():
        print("Creating sample user...")
        user = User.objects.create_user(
            username='john@example.com',
            email='john@example.com',
            password='password123',
            first_name='John',
            last_name='Doe',
            phone='1234567890'
        )
    else:
        user = User.objects.get(email='john@example.com')

    # Create Sample Items
    sample_items = [
        {
            'title': 'iPhone 13 Pro',
            'description': 'Lost near Central Park, black case with blue phone. Has a small crack on the screen corner.',
            'status': 'lost',
            'category': 'electronics',
            'location': 'Central Park, NYC',
            'date': '2024-02-04',
            'time': '14:30',
            'posted_by': 'Sarah Johnson',
            'contact': 'sarah.j@email.com',
            'reward': '₹5000',
            'image_path': None
        },
        {
            'title': 'Brown Leather Wallet',
            'description': 'Found on subway platform, contains ID and credit cards. Brown leather with metal clasp.',
            'status': 'found',
            'category': 'accessories',
            'location': 'Times Square Station',
            'date': '2024-02-04',
            'time': '09:15',
            'posted_by': 'Mike Chen',
            'contact': 'mike.chen@email.com',
            'reward': None,
            'image_path': None
        },
        {
            'title': 'Silver Watch',
            'description': 'Lost during morning jog, sentimental value. Citizen brand with leather strap.',
            'status': 'lost',
            'category': 'jewelry',
            'location': 'Brooklyn Bridge',
            'date': '2024-02-03',
            'time': '07:45',
            'posted_by': 'David Wilson',
            'contact': 'd.wilson@email.com',
            'reward': '₹8000',
            'image_path': None
        }
    ]

    print("Creating sample items...")
    for item_data in sample_items:
        Item.objects.get_or_create(
            title=item_data['title'],
            defaults={
                'user': user,
                'description': item_data['description'],
                'status': item_data['status'],
                'category': item_data['category'],
                'location': item_data['location'],
                'date': item_data['date'],
                'time': item_data['time'],
                'posted_by': item_data['posted_by'],
                'contact': item_data['contact'],
                'reward': item_data['reward'],
                'image_path': item_data['image_path']
            }
        )
    
    print("✅ Database seeded successfully!")

if __name__ == '__main__':
    seed()
