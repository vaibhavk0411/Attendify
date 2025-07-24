# Attendify - Serverless Attendance System Using Face Recognition

A modern, real-time attendance tracking system that uses **React + AWS Rekognition + Serverless Architecture** to detect faces and log attendance.

---

## 📸 Overview

This project captures live images using a webcam or mobile device, identifies users using AWS Rekognition, and logs their attendance in DynamoDB—all without traditional servers.

---

## 🧩 Tech Stack

| Layer      | Technology                                 |
|------------|--------------------------------------------|
| Frontend   | Vite + React + TypeScript + TailwindCSS    |
| Backend    | AWS Lambda (Node.js)                       |
| Auth       | AWS Cognito (User Pool + Identity Pool)    |
| Storage    | Amazon S3                                  |
| Face Match | AWS Rekognition (CompareFaces API)         |
| Database   | Amazon DynamoDB                            |
| Hosting    | Static Website on Amazon S3                |

---


---

## 🚀 How It Works

1. **User Authentication**
   - Uses AWS Cognito for login (with Identity Pool for S3 & API access).

2. **Image Capture & Upload**
   - User captures an image via webcam using `react-webcam`.
   - Image is uploaded to Amazon S3 using AWS SDK v3 and `PutObjectCommand`.

3. **Lambda + Rekognition**
   - Frontend calls an API Gateway endpoint that triggers a Lambda function.
   - Lambda fetches the image from S3, compares it using Rekognition's `CompareFaces`.
   - If match ≥ 90%, the attendance is logged to DynamoDB.

4. **Attendance Logging**
   - Records include timestamp, employee ID, and recognition similarity.

---

## 🔐 Security Features

- AWS Cognito used for auth and temporary IAM credentials.
- Fine-grained IAM roles for S3, Lambda, and DynamoDB access.
- Image data is not stored permanently; S3 lifecycle policy can auto-delete uploads.
- Attendance only marked for recognized users (similarity ≥ 90%).

---
📽️ **Demo Video:** [Watch here]
---

## 🧪 Local Setup

Follow these steps to run the project locally:

### 1. Install Dependencies  
Ensure you have Node.js installed on your machine. Then run:

```bash
npm install
```

###2 . Configure Environment Variables
Create a .env file in the root directory with the following content:

```
VITE_BUCKET_NAME=attendify-user-uploads
VITE_REGION=ap-south-1
VITE_IDENTITY_POOL_ID=ap-south-1:xxxx-xxxx-xxxx-xxxx
VITE_API_GATEWAY_URL=https://xxxxxx.execute-api.ap-south-1.amazonaws.com/prod/mark-attendance
```

3. Start the Development Server
Run the Vite development server:
```
npm run dev
```
The app should now be running at http://localhost:5173.






