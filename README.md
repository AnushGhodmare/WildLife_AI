# Wildlife Monitoring and Alert Generation

An AI-powered wildlife detection system that identifies animals from uploaded images using YOLOv8n and generates monitoring alerts through a React and Flask-based web application.

---

# Tech Stack

## Frontend

* React.js
* Axios
* CSS

## Backend

* Flask
* Flask-CORS

## AI Model

* YOLOv8n
* OpenCV
* Ultralytics

---

# Features

* Upload wildlife images
* Real-time animal detection
* Bounding box visualization
* Confidence score prediction
* Species monitoring dashboard
* Alert generation system
* Lightweight YOLOv8n inference

---

# Project Structure

```bash
wildlife-monitoring-alert-generation/
│
├── frontend/
├── backend/
├── screenshots/
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-username/wildlife-monitoring-alert-generation.git

cd wildlife-monitoring-alert-generation
```

---

# Backend Setup

## Create Virtual Environment

```bash
python -m venv venv
```

## Activate Environment

### Windows

```bash
venv\Scripts\activate
```

### Linux / Mac

```bash
source venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run Flask Server

```bash
python app.py
```

Backend runs on:

```bash
http://127.0.0.1:5000
```

---

# Frontend Setup

## Install Dependencies

```bash
cd frontend
npm install
```

## Start React App

```bash
npm start
```

Frontend runs on:

```bash
http://localhost:3000
```

---

# YOLOv8n Detection

```python
from ultralytics import YOLO

model = YOLO("yolov8n.pt")
results = model("image.jpg")
```

---

# API Endpoint

## Detect Wildlife

```http
POST /detect
```

### Response

```json
{
  "detected_animals": [
    {
      "name": "Leopard",
      "confidence": 89.4
    }
  ]
}
```

---

# Screenshots

## Home Interface

File Name: `WhatsApp Image 2026-05-12 at 7.49.36 PM (2).jpeg`

![Home Interface](screenshots/WhatsApp Image 2026-05-12 at 7.49.36 PM (2).jpeg)

## Wildlife Detection Result

File Name: `WhatsApp Image 2026-05-12 at 7.49.36 PM (3).jpeg`

![Detection Result](screenshots/WhatsApp Image 2026-05-12 at 7.49.36 P

---

# Future Improvements

* Live CCTV monitoring
* Email/SMS alerts
* GPS-based wildlife tracking
* Database integration
* Mobile application support

---

# Requirements

## Backend

```txt
Flask
flask-cors
opencv-python
ultralytics
numpy
Pillow
```

## Frontend

```txt
react
axios
```

---

# Academic Project

This project was developed for academic and learning purposes focused on AI-powered wildlife monitoring and detection systems.
