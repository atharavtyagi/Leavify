# Leavify Deployment Guide

This guide provides step-by-step instructions to deploy the Leavify application to the cloud for free using modern PAAS (Platform as a Service) providers.

We recommend deploying the **Frontend** on **Vercel** and the **Backend** on **Render**.

---

## 1. Prerequisites
- Your code is already pushed to GitHub.
- You have an active MongoDB Atlas cluster (already configured in your `.env`).
- You have accounts on [Vercel](https://vercel.com/) and [Render](https://render.com/).

---

## 2. Deploying the Backend (Render)

Render is great for Node.js backends.

1. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub account and select your `Leavify` repository.
3. Configure the following settings for the Web Service:
    - **Name**: `leavify-api` (or whatever you prefer)
    - **Root Directory**: `backend` (Important: This tells Render to only build the backend folder)
    - **Environment**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
4. Expand the **Environment Variables** section and add all your secrets from your backend `.env` file:
    - `PORT`: `5000`
    - `MONGO_URI`: (Paste your connection string)
    - `JWT_SECRET`: (Paste your JWT string)
    - `DEPARTMENT_LEAVE_LIMIT`: `2`
    - `SMTP_HOST`: `smtp.gmail.com`
    - `SMTP_PORT`: `587`
    - `SMTP_USER`: `leavify8@gmail.com`
    - `SMTP_PASS`: (Paste your App Password)
    - `SMTP_FROM`: `"Leavify HR" <leavify8@gmail.com>`
5. Click **Create Web Service**. 
6. Wait for it to build and deploy. Once live, Render will give you a public URL for your API (e.g., `https://leavify-api-xyz.onrender.com`).
    - **Copy this URL**. You will need it for the frontend!

---

## 3. Deploying the Frontend (Vercel)

Vercel is the creator of Next.js and provides world-class hosting for React/Vite applications.

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** -> **Project**.
2. Connect your GitHub account and import your `Leavify` repository.
3. Once imported, configure the Project Settings:
    - **Project Name**: `leavify`
    - **Framework Preset**: Select `Vite`
    - **Root Directory**: Click "Edit" and change it to `frontend`
4. Expand the **Environment Variables** section. Here you must tell the frontend how to talk to the live backend:
    - **Name**: `VITE_API_URL`
    - **Value**: `https://leavify-api-xyz.onrender.com/api` (Replace with your actual Render URL, making sure to append `/api` at the end!)
6. Click **Deploy**.
7. Vercel will install dependencies, build the React frontend, and deploy it to a live public URL.

---

## 4. Post-Deployment Checks

1. Visit your new live Vercel URL.
2. Log in with your Admin credentials to ensure the Frontend is successfully communicating with the Render Backend.
3. Try approving a leave or checking settings to ensure the database and email servers respond correctly in the production environment.

**Congratulations! Your application is now live.**
