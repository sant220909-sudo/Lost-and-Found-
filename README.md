# FindIt - Lost & Found Community Platform

A modern, full-stack web application for reporting and finding lost items in your community.

## 🚀 Features

- **Report Lost Items** - Submit detailed reports with images
- **Report Found Items** - Help reunite items with their owners
- **Advanced Search** - Filter by status, category, location
- **Image Upload** - Upload photos of lost/found items
- **User Profiles** - Manage your account and items
- **Dark/Light Theme** - Toggle between themes
- **Responsive Design** - Works on all devices
- **SQLite Database** - Persistent data storage

## 📋 Prerequisites

- Python 3.7 or higher
- pip (Python package manager)

## 🛠️ Installation

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- Flask (Web framework)
- flask-cors (Cross-Origin Resource Sharing)
- Werkzeug (WSGI utilities)

### 2. Start the Flask Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

You should see:
```
🚀 Starting FindIt Flask Server...
📊 Database: SQLite (findit.db)
📁 Upload folder: static/uploads/
🌐 Server running on: http://localhost:5000
✅ Database initialized successfully!
```

### 3. Access the Application

Open your browser and go to:
```
http://localhost:5000
```

## 📁 Project Structure

```
FindIt/
├── app.py                  # Flask backend server
├── requirements.txt        # Python dependencies
├── findit.db               # SQLite database (auto-created)
├── static/                 # Static assets (CSS, JS, Images)
│   ├── css/
│   │   └── styles.css      # All styling
│   ├── js/
│   │   ├── main.js         # Core functionality
│   │   ├── auth.js         # Authentication
│   │   └── ...             # Other JS files
│   └── uploads/            # Uploaded images folder
├── templates/              # HTML Templates
│   ├── index.html          # Homepage
│   ├── login.html          # Authentication page
│   ├── profile.html        # User profile
│   ├── edit-profile.html   # Profile editing
│   ├── my-items.html       # User's items management
│   ├── browse.html         # Search & browse items
│   ├── item-detail.html    # Item details
│   ├── report-lost.html    # Report lost items
│   ├── report-found.html   # Report found items
│   └── about.html          # About page
└── seed_db.py              # Database seeder
```

## 🔌 API Endpoints

### Get All Items
```
GET /api/items
Query Parameters:
  - status: lost|found
  - category: electronics|accessories|bags|documents|jewelry|clothing|other
  - search: search term
```

### Get Single Item
```
GET /api/items/<item_id>
```

### Report Lost Item
```
POST /api/report-lost
Form Data:
  - itemName (required)
  - category (required)
  - description (required)
  - location (required)
  - dateLost (required)
  - timeLost (optional)
  - contactInfo (required)
  - reward (optional)
  - additionalInfo (optional)
  - itemImage (optional, file)
```

### Report Found Item
```
POST /api/report-found
Form Data:
  - itemName (required)
  - category (required)
  - description (required)
  - location (required)
  - dateFound (required)
  - timeFound (optional)
  - contactInfo (required)
  - additionalInfo (optional)
  - itemImage (optional, file)
```

## 🎨 Features in Detail

### Image Upload
- Supports PNG, JPG, JPEG, GIF
- Maximum file size: 5MB
- Images stored in `static/uploads/` folder
- Automatic filename sanitization

### Database Schema
```sql
CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    posted_by TEXT NOT NULL,
    contact TEXT NOT NULL,
    reward TEXT,
    additional_info TEXT,
    image_path TEXT,
    date_reported TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## 🐛 Troubleshooting

### Port Already in Use
If port 5000 is already in use, modify `app.py`:
```python
app.run(debug=True, port=5001)  # Change to different port
```

### CORS Errors
Make sure flask-cors is installed:
```bash
pip install flask-cors
```

### Database Issues
Delete `findit.db` and restart the server to recreate the database:
```bash
rm findit.db
python app.py
```

### Image Upload Issues
Make sure the `uploads/` folder has write permissions:
```bash
chmod 755 static/uploads/
```

## 🔒 Security Notes

**This is a development version. For production:**
- Add user authentication
- Implement CSRF protection
- Add input sanitization
- Use environment variables for configuration
- Add rate limiting
- Implement proper error handling
- Use HTTPS
- Add image validation and scanning

## 📝 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Feel free to fork, modify, and use this project for your own purposes!

## 📧 Support

For issues or questions, please check the troubleshooting section above.

---

**Built with ❤️ using Flask, SQLite, and modern web technologies**
