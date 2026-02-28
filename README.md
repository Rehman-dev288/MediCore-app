# 💊 MediCore - Online Medical Store Management System

MediCore is a sophisticated, enterprise-grade E-Pharmacy solution designed to bridge the gap between patients, pharmacists, and administrators. It handles everything from smart medicine discovery to complex prescription-based ordering and real-time business analytics.

---

## 🚀 Project Overview

- **Live Database:** Hosted on Aiven Cloud (MySQL)
- **Architecture:** Client-Server Architecture (REST API)
- **Security:** JWT Authentication & Bcrypt Password Hashing

---

🏗️ System Architecture
The application follows a Decoupled Client-Server Architecture, ensuring high scalability and independent deployment.

Frontend: React.js hosted on Vercel, optimized for lightning-fast UI rendering.

Backend: Node.js/Express.js hosted on Render, managing business logic and API routing.

Database: Cloud-hosted MySQL on Aiven, ensuring relational data integrity and 99.9% uptime.

---

## 🛠️ Tech Stack

| Layer        | Technology                      | Purpose                                  |
| ------------ | ------------------------------- | ---------------------------------------- |
| **Frontend** | React 18/19, React Router v6    | Single-page application framework        |
| **UI**       | Tailwind CSS, Shadcn/UI, Lucide | Modern styling and accessible components |
| **Charts**   | Recharts                        | Data visualization for Admin             |
| **PDF**      | jsPDF + jspdf-autotable         | Client-side invoice generation           |
| **Backend**  | Node.js + Express.js            | Fast and scalable REST API               |
| **Database** | MySQL 8.0 (Aiven Cloud)         | Relational data storage                  |
| **Auth**     | JWT (JsonWebToken)              | Secure, stateless authentication         |
| **Storage**  | Multer                          | Local storage for prescriptions          |

---

## ✨ Features

### 👤 Customer Portal

- **Role-Based Auth:** Separate flows for Patient, Doctor, and Pharmacist.
- **Smart Catalog:** Browse medicines with search, category filters, and stock status.
- **Shopping Cart:** persistent cart management with automatic total calculation.
- **Prescription System:** Mandatory upload for restricted drugs with PDF/Image support.
- **Invoicing:** Instant PDF invoice generation after successful orders.
- **Order History:** Track fulfillment status (Pending, Shipped, Delivered).

### 🛡️ Admin Console

- **Analytics Dashboard:** Real-time metrics for total revenue, orders, and user growth.
- **Inventory Control:** Full CRUD operations for the medicine catalog.
- **Order Fulfillment:** Management of order lifecycle and status updates.
- **Prescription Review:** dedicated interface to approve or reject customer prescriptions.
- **Governance:** Manage user roles (e.g., upgrading a user to Admin).
- **Low Stock Alerts:** Automatic warnings for medicines with low inventory.

---

## 📂 Project Structure

```text
medicore/
├── backend/
│   ├── config/             # Database connection (db.js)
│   ├── middleware/         # Auth and Admin guards
│   ├── routes/             # Express route handlers
│   ├── uploads/            # Prescription storage
│   ├── .env                # Database & JWT credentials
│   └── server.js           # API Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI (Navbar, UI kit)
│   │   ├── contexts/       # Auth & Cart State
│   │   ├── lib/            # Axios instance & PDF logic
│   │   └── pages/          # View components
│   └── .env                # Backend URL configuration
│
└── Documentation/          # SRS and Technical reports

```
🤝 Contribution
Developed with ❤️ by Rehman-dev288. This project showcases the power of modern JavaScript stacks in solving real-world healthcare logistics problems.

---

🚀 Live Demo
Live Demo: https://medicore-three.vercel.app
