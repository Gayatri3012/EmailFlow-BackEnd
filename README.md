
# 🧩 EmailFlow Backend

This is the **backend** API for the EmailFlow app. It handles user authentication, Google OAuth, flowchart creation, and scheduling email sequences.


🌐 **Hosted URL:** [https://emailflow-backend.onrender.com](https://emailflow-backend.onrender.com)

---

## 🛠️ Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** for authentication
- **Google OAuth 2.0**
- **Agenda.js** for email scheduling
- **Nodemailer** for sending emails (currently using test account)

---

## 🚀 Features

- User authentication with JWT
- Google OAuth 2.0 login
- Flowchart creation and editing
- Delay node support (currently in **minutes** for testing)
- Email scheduling via Agenda.js
- Demo login credentials available

---

## 📁 Folder Structure

```
backend/
├── controllers/
│   ├── authController.js
│   └── flowchartController.js
├── models/
│   ├── User.js
│   └── Flowchart.js
├── routes/
│   ├── authRoutes.js
│   └── flowchartRoutes.js
├── jobs/
│   └── emailJobs.js
├── middleware/
│   └── isAuth.js
├── config/
│   └── agenda.js
├── .env
├── index.js
```

---

## ⚙️ Setup Instructions

```bash
git clone https://github.com/Gayatri3012/EmailFlow-BackEnd.git
cd emailflow-backend
npm install
npm run dev
```

Create a `.env` file:

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```
ℹ️ Note: Currently using a test account from Nodemailer for sending emails. Replace with your SMTP credentials before deploying to production.

---

## 🔐 Authentication & OAuth

- JWT-based authentication with access token
- Google OAuth 2.0 strategy
- Middleware (isAuth.js) to protect API routes
- Token expiry and validation on every request

---

## 🔄 API Endpoints

### Auth Routes

| Method | Endpoint         | Description           |
|--------|------------------|-----------------------|
| POST   | /api/auth/signup | User registration     |
| POST   | /api/auth/login  | Login with email/pass |
| POST   | /api/auth/google | Google OAuth login    |

### Flowchart Routes

| Method | Endpoint                                 | Description              |
|--------|------------------------------------------|--------------------------|
| GET    | /emailFlow/flowcharts/:userId            | Get all flowcharts       |
| GET    | /emailFlow/flowchart/:flowchartId        | Get a single flowchart   |
| POST   | /emailFlow/flowchart                     | Save or update flowchart |


---

## 📧 Email Scheduling (Agenda + Nodemailer)

- Agenda.js is used for scheduling email jobs.
- Jobs are saved in MongoDB.
- Nodemailer sends the emails via an SMTP account.
- Emails are scheduled as part of Delay nodes in a flowchart.
- Delay node's delay is currently interpreted in minutes (not hours) for testing purposes.

---

## 🧪 Testing

- Currently no automated tests written.
- Tested using Postman or other API clients.
- Future scope includes integration of Jest or Mocha for backend testing.

---

## ⚠️ Known Limitations

- Delay time is parsed as minutes even if hours are selected in the frontend (testing mode).

---

## 🧾 License

MIT – For educational/demo purposes only.
