# FocusHire

## 🚀 Project Title

**Focus, Object & Audio Detection in Video Interviews**

---

## 🎯 Objective

Develop an advanced **video proctoring system** that ensures interview integrity by:

* Detecting whether a candidate is focused during an online interview.
* Flagging unauthorized items (phone, notes, books, extra devices).
* Logging **audio anomalies** during the interview.
* Allowing interviewers to **watch recordings** and **delete past data** for better management.

---

## 🛠 Features

### 🎥 Frontend (Interview Screen)

* Built using **React (Vite + Tailwind)**.
* Candidate video is recorded and securely uploaded (**Cloudinary**).
* Real-time logs of:

  * Focus lost
  * Unauthorized items
  * Audio anomalies
* Interviewer can later **view recordings & reports**.

---

### 🧠 Focus Detection

* Powered by **MediaPipe + TensorFlow\.js**.
* Detects:

  * User looking away **>5s**.
  * No face detected **>10s**.
* Logs all events with timestamps.

---

### 📑 Item Detection & Suspicious Activity

* Uses **TensorFlow\.js Object Detection**.
* Flags events like:

  * 📱 Phone detected
  * 📒 Notes/book detected
  * 👥 Multiple faces detected
  * 🚫 No face detected
* All suspicious activities stored in **MongoDB Atlas**.

---

### 🎙️ Audio Detection *(Extra Feature)*

* **Audio anomaly detector** on the interview page.
* Detects:

  * Background noises (multiple voices, sudden loud sound).

---

### 🖥 Backend (Express + MongoDB)

* Securely stores:

  * Interviews
  * Events
  * Reports
* APIs for full CRUD support:

  * Create new interview
  * End interview + generate report
  * Fetch all reports
  * Watch candidate video
  * Delete past interview data

---

### 📊 Reporting

* Proctoring report includes:

  * Candidate details (Name, Email, Time).
  * Interview duration.
  * Suspicious events summary (focus, audio, objects).
  * **Integrity Score** = `100 – deductions`.
* Export report as **PDF**.
* Interviewer can:

  * 🖥 **Watch candidate video** directly in the dashboard.
  * 🗑 **Delete previous interview data** when no longer needed.

---

## 📂 Project Structure

```
FocusHire/
│
├── frontend/             # React (Vite + Tailwind)
│   └── src/
│       ├── pages/
│       │   ├── InterviewScreen.jsx
│       │   ├── ReportsPage.jsx
│       │   └── ReportDetails.jsx
│       └── components/
│
├── backend/              # Express + MongoDB
│   ├── routes/
│   │   ├── Interview.route.js
│   │   ├── Event.route.js
│   │   └── Reports.route.js
│   ├── models/
│   │   ├── Interview.model.js
│   │   ├── Event.model.js
│   │   └── Report.model.js
│   ├── utils/
│   │   ├── connectDb.js
│   │   └── reportGenerator.js
│   └── server.js
│
└── README.md
```

---

## ⚡ Installation & Setup

### 🔹 Backend

```bash
cd backend
pnpm install
pnpm start
```

Runs at: **[http://localhost:3000](http://localhost:3000)**

---

### 🔹 Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Runs at: **[http://localhost:5173](http://localhost:5173)**

---

## 🔗 API Endpoints

* `POST /api/interview` → Start new interview.
* `PUT /api/interview/:id/end` → End & generate report.
* `POST /api/events` → Log suspicious event.
* `GET /api/reports` → Fetch all reports.
* `GET /api/reports/:id` → Fetch single report.
* `DELETE /api/interview/:id` → Delete interview + all related data.
