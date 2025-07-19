Perfect — here’s a **production-ready README** for your deployed MERN Chat App with CI/CD, Vercel, and Render integrations:

---

# 🗨️ MERN Chat App – Real-Time Messaging with DevOps 🚀

This is a real-time chat application built with the **MERN stack** (MongoDB, Express, React, Node.js), using **Socket.io** for live communication, deployed via **Vercel** (frontend) and **Render** (backend), and integrated with **GitHub Actions** for continuous deployment.

Live Demo:

* 🖥️ Frontend: [https://chatapp-uuci.vercel.app/](https://chatapp-uuci.vercel.app/)
* 🌐 Backend: [https://week-7-devops-deployment-assignment-9ycj.onrender.com/rooms](https://week-7-devops-deployment-assignment-9ycj.onrender.com/rooms)

---

## 📦 Tech Stack

* **Frontend:** React + Tailwind CSS + Vite
* **Backend:** Express.js + Node.js + MongoDB
* **Realtime:** Socket.io
* **Database:** MongoDB Atlas
* **CI/CD:** GitHub Actions + Vercel + Render

---

## ✨ Features

* 🔒 Room creation & deletion (admin-only)
* ⚡ Real-time chat with Socket.io
* 💬 Message persistence in MongoDB
* 📁 Room selection and joining
* 📝 Typing indicators
* 🧑 Online users list
* 🎨 Responsive modern UI with Tailwind CSS
* 🚀 CI/CD with automated deployments

---

## 🛠 Project Structure

```
├── client/              # Frontend React app (Vercel)
│   └── src/
│       └── components/
│       └── App.jsx
│       └── main.jsx
├── server/              # Backend Node + Express app (Render)
│   └── controllers/
│   └── models/
│   └── routes/
│   └── socket/
│   └── server.js
├── .github/workflows/   # GitHub Actions for CI/CD
│   └── mern-ci-cd.yml
```

---

## 🚀 Local Development

### 1. Clone Repo

```bash
git clone https://github.com/PLP-MERN-Stack-Development/week-7-devops-deployment-assignment-Jepkosgei3.git
cd week-7-devops-deployment-assignment-Jepkosgei3
```

### 2. Set Up Environment Variables

#### In `client/.env`:

```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

#### In `server/.env`:

```env
PORT=4000
MONGO_URI=mongodb+srv://<your_mongo_uri>
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

### 3. Run Locally

#### Backend:

```bash
cd server
npm install
npm run dev
```

#### Frontend:

```bash
cd client
npm install
npm run dev
```

---

## 🔄 Deployment

### Frontend – Vercel

* Auto-deploys on `main` branch push
* Uses `vercel.json` to define build settings

### Backend – Render

* Create Web Service from `server/`
* Add `web: node server.js` as start command
* Set environment variables in Render dashboard

### CI/CD – GitHub Actions

Workflow file: `.github/workflows/mern-ci-cd.yml`

```yaml
name: MERN CI/CD

on:
  push:
    branches:
      - main

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: ⬇️ Checkout Code
        uses: actions/checkout@v4

      - name: 🔧 Install Dependencies
        run: |
          cd client
          npm install

      - name: ✅ Check Frontend Health
        run: curl -sSf ${{ secrets.FRONTEND_URL }}

      - name: 🚀 Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./client
          prod: true
```

---

## 📷 Screenshots

<img src="./images/creating-room.png" width="500"/>
<img src="./images/user1-chat.png" width="500"/>
<img src="./images/user2-join.png" width="500"/>
<img src="./images/user2-chat.png" width="500"/>

---


## 👩🏽‍💻 Author

**Mercy Jepkosgei**
[GitHub](https://github.com/Jepkosgei3)




