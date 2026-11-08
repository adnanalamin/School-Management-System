# 🎓 School Management System

### Modern • Secure • Scalable • Full-Stack Education Management Platform

A production-ready **School Management System** built with **React, TypeScript, Express, MongoDB, and modern web technologies**.

Designed to manage students, teachers, parents, academics, attendance, examinations, results, fees, library, communication, reports, and administrative operations from a unified platform.

<p align="center">
  <strong>🏫 One Platform • Complete School Management • Secure by Design</strong>
</p>

---

## ✨ Overview

The School Management System is a modern full-stack platform designed to digitize and simplify day-to-day school operations.

It provides separate experiences and permissions for:

- 👑 Super Administrators
- 🛡️ Administrators
- 👨‍🏫 Teachers
- 👨‍🎓 Students
- 👨‍👩‍👧 Parents
- 💰 Accountants
- 📚 Librarians
- 👥 Staff

The system is designed around **security, scalability, usability, performance, and maintainability**.

---

# 🚀 Highlights

| Area | Features |
|---|---|
| 🔐 Authentication | JWT, secure cookies, refresh tokens, password security |
| 🛡️ Authorization | RBAC + granular permissions |
| 👨‍🎓 Students | Profiles, admission, search, filtering, promotion |
| 👨‍🏫 Teachers | Profiles, subjects, classes, attendance, leave |
| 👨‍👩‍👧 Parents | Multiple children, academic & financial access |
| 📚 Academics | Classes, sections, subjects, sessions |
| 📝 Attendance | Student & teacher attendance |
| 🧪 Examination | Exams, schedules, marks, grading |
| 🏆 Results | GPA, grades, report cards, marksheets |
| 💳 Fees | Invoices, payments, discounts, dues |
| 💰 Finance | Income, expenses, financial reports |
| 💼 Payroll | Salary, deductions, allowances, payslips |
| 📖 Library | Books, issue, return, fines |
| 📢 Communication | Notices, events, messages, notifications |
| 📁 Documents | Secure document management |
| 📊 Reports | PDF, Excel, CSV, print |
| 🧾 Certificates | ID cards, testimonials, certificates |
| 🔍 Audit | Activity logs & security tracking |
| 📱 Responsive | Desktop, tablet & mobile |

---

# 🎨 Design Philosophy

The interface follows a modern SaaS dashboard approach rather than a traditional school software UI.

### Design principles

- Clean visual hierarchy
- Minimal cognitive load
- Consistent spacing
- Responsive layouts
- Accessible components
- Data-focused dashboards
- Reusable UI components
- Fast navigation
- Clear feedback states
- Professional enterprise appearance

### UI States

Every major feature supports:

```text
Loading
    ↓
Success
    ↓
Empty
    ↓
Error
    ↓
Retry
```

---

# 🖥️ Dashboard Experience

The main dashboard provides a real-time overview of the school.

### Dashboard statistics

```text
┌─────────────────┐ ┌─────────────────┐
│ 👨‍🎓 Students    │ │ 👨‍🏫 Teachers    │
│     2,540       │ │       86        │
└─────────────────┘ └─────────────────┘

┌─────────────────┐ ┌─────────────────┐
│ 📊 Attendance   │ │ 💰 Fee Revenue  │
│     92.4%       │ │   ৳12,50,000    │
└─────────────────┘ └─────────────────┘
```

### Analytics

- Student growth
- Attendance trends
- Fee collection
- Expenses
- Academic performance
- Class distribution
- Gender distribution
- Admission statistics

---

# 🧩 Core Modules

## 👨‍🎓 Student Management

Manage the complete student lifecycle.

### Student information

- Student ID
- Admission number
- Name
- Photo
- Date of birth
- Gender
- Blood group
- Class
- Section
- Roll
- Academic session
- Contact information
- Guardian information
- Emergency contact
- Admission date
- Status

### Operations

- Create
- Update
- View
- Archive
- Restore
- Search
- Filter
- Sort
- Pagination
- Export
- Print

---

# 👨‍🏫 Teacher & Staff Management

Manage teachers and staff from a centralized system.

### Teacher management

- Employee ID
- Department
- Designation
- Subjects
- Classes
- Qualification
- Experience
- Joining date
- Salary
- Contact information

### Staff management

- Employee profile
- Department
- Designation
- Attendance
- Leave
- Salary
- Documents

---

# 📚 Academic Management

Academic hierarchy:

```text
Academic Year
      ↓
Class
      ↓
Section
      ↓
Subject
      ↓
Teacher
      ↓
Students
```

Supports:

- Academic sessions
- Classes
- Sections
- Subjects
- Teacher assignments
- Student enrollment
- Student promotion

---

# 🕐 Attendance Management

### Student attendance

```text
✓ Present
✕ Absent
L Late
🏖 Leave
```

Features:

- Daily attendance
- Bulk attendance
- Monthly reports
- Class attendance
- Individual attendance
- Attendance percentage
- Teacher attendance

---

# 📝 Examination & Results

Complete examination lifecycle:

```text
Exam
 ↓
Schedule
 ↓
Subject
 ↓
Marks Entry
 ↓
Calculation
 ↓
Result
 ↓
Report Card
```

Automatically calculate:

- Total marks
- Percentage
- Grade
- GPA
- Pass/Fail
- Position where applicable

All critical calculations are performed server-side.

---

# 💳 Fee Management

Manage the complete student fee lifecycle.

### Fee types

- Admission fee
- Tuition fee
- Examination fee
- Library fee
- Transport fee
- Hostel fee
- Fine
- Other fees

### Payment methods

- Cash
- Bank
- bKash
- Nagad
- Rocket
- Card
- Online payment

Includes:

- Invoices
- Discounts
- Payments
- Dues
- Receipts
- Transaction history
- Financial reports

---

# 💰 Finance & Payroll

### Finance

Track:

- Income
- Expenses
- Transactions
- Categories
- Financial reports

### Payroll

Calculate:

```text
Basic Salary
+ Allowances
+ Bonus
- Deductions
- Tax
----------------
Net Salary
```

Generate salary history and payslips.

---

# 📖 Library Management

Complete library workflow:

```text
Book
 ↓
Availability
 ↓
Issue
 ↓
Due Date
 ↓
Return
 ↓
Fine
```

Supports:

- Books
- Authors
- Categories
- Publishers
- ISBN
- Copies
- Members
- Issue history
- Return history
- Fine calculation

---

# 📢 Communication

### Notices

- General notices
- Academic notices
- Exam notices
- Holiday notices
- Admission notices
- Emergency notices

### Events

- Sports
- Cultural programs
- Meetings
- Seminars
- Workshops
- School events

### Notifications

- Fee reminders
- Result announcements
- Assignment notifications
- Exam reminders
- Leave updates

---

# 📊 Reports Center

Centralized reporting system:

```text
Student Reports
Attendance Reports
Exam Reports
Result Reports
Fee Reports
Payment Reports
Expense Reports
Payroll Reports
Library Reports
Admission Reports
Teacher Reports
```

Export formats:

- PDF
- Excel
- CSV
- Print

---

# 🪪 ID Cards & Certificates

Generate professional printable documents:

### ID Cards

- Student ID
- Teacher ID
- Staff ID

### Certificates

- Testimonial
- Character Certificate
- Transfer Certificate
- Participation Certificate
- Academic Certificate

Templates can use school branding such as:

- Logo
- School name
- Address
- Signature
- Footer
- Theme colors

---

# 🔐 Security

Security is treated as a core architectural requirement.

### Authentication

- JWT authentication
- HTTP-only cookies
- Refresh tokens
- Secure password hashing
- Password reset
- Session management

### API Security

- Helmet
- CORS
- Rate limiting
- Zod validation
- Input sanitization
- NoSQL injection protection
- XSS protection
- Secure error handling

### Authorization

```text
Authentication
      ↓
Role Check
      ↓
Permission Check
      ↓
Resource Authorization
      ↓
Controller
```

Frontend permission checks are never treated as the primary security layer.

---

# 🕵️ Audit Logging

Sensitive actions are recorded.

Example:

```text
Admin
  ↓
Updated Student
  ↓
STD-2026-001
  ↓
08 Nov 2026 — 11:30 AM
```

Audit logs can track:

- User
- Action
- Module
- Resource
- Timestamp
- Request ID
- IP metadata where appropriate

Sensitive information is never logged unnecessarily.

---

# 🏗️ Architecture

```text
┌──────────────────────────────────────────────┐
│                  CLIENT                      │
│                                              │
│ React + TypeScript + Vite                    │
│ Tailwind + shadcn/ui                         │
│ React Router                                 │
│ TanStack Query                               │
│ React Hook Form + Zod                        │
└──────────────────────┬───────────────────────┘
                       │
                       │ REST API
                       ▼
┌──────────────────────────────────────────────┐
│                  SERVER                      │
│                                              │
│ Node.js + Express + TypeScript               │
│ Zod + Helmet + CORS + Rate Limiting          │
│ Pino Logging                                 │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                 DATABASE                     │
│                                              │
│ MongoDB + Mongoose                           │
└──────────────────────────────────────────────┘
```

---

# 📁 Project Structure

```text
school-management-system/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── lib/
│   │   └── main.tsx
│   │
│   └── public/
│
├── server/
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── modules/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── validators/
│       └── server.ts
│
├── docs/
│   ├── PHASE-01.md
│   ├── PHASE-02.md
│   ├── PHASE-03.md
│   └── DATABASE.md
│
├── docker-compose.yml
├── package.json
└── README.md
```

---

# 🛠️ Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| React | UI |
| Vite | Build tool |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| React Router | Routing |
| TanStack Query | Server state |
| React Hook Form | Forms |
| Zod | Validation |
| Recharts | Analytics |

## Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express | API framework |
| TypeScript | Type safety |
| MongoDB | Database |
| Mongoose | ODM |
| Zod | Validation |
| Helmet | Security |
| CORS | Cross-origin security |
| Rate Limiting | API protection |
| Pino | Logging |
| Vitest | Testing |
| Supertest | API testing |

---

# 📦 Monorepo

This project uses **npm workspaces**.

```text
school-management-system/
│
├── client/
├── server/
└── docs/
```

The client and server can be developed together from the repository root.

---

# ⚡ Quick Start

## Requirements

- Node.js `20.11+`
- npm
- Docker
- Docker Compose
- MongoDB

---

## 1. Clone the repository

```bash
git clone <your-repository-url>

cd school-management-system
```

---

## 2. Install dependencies

```bash
npm install
```

This installs dependencies for both workspaces.

---

## 3. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

Review the environment variables before starting the application.

> Never commit `.env` files or production secrets.

---

## 4. Start MongoDB

```bash
npm run db:up
```

Local MongoDB:

```text
127.0.0.1:27017
```

---

## 5. Seed baseline data

```bash
npm run db:seed
```

This creates:

- Permissions
- System roles
- Default settings

---

## 6. Start development

```bash
npm run dev
```

Application:

```text
Frontend → http://localhost:5173
API      → http://localhost:5000
```

The dashboard status card displays live API and database health.

---

# 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start client + server |
| `npm run build` | Build client + server |
| `npm run typecheck` | TypeScript validation |
| `npm test` | Run server tests |
| `npm run db:up` | Start MongoDB |
| `npm run db:down` | Stop MongoDB |
| `npm run db:seed` | Seed baseline data |
| `npm run db:indexes` | Show database indexes |
| `npm run db:indexes:apply` | Apply database indexes |

---

# 🔌 API Response Convention

Every API response follows a consistent envelope.

### Success

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": {},
    "requestId": "req_123"
  }
}
```

This makes frontend API handling predictable and maintainable.

---

# 🧠 Development Conventions

### Server

Feature-specific backend code belongs in:

```text
server/src/modules/<feature>
```

Example:

```text
server/src/modules/students/
├── student.model.ts
├── student.controller.ts
├── student.service.ts
├── student.routes.ts
├── student.schema.ts
└── student.types.ts
```

### Client

Feature-specific frontend code belongs in:

```text
client/src/features/<feature>
```

Example:

```text
client/src/features/students/
├── components/
├── pages/
├── hooks/
├── api/
├── schemas/
└── types/
```

Shared UI belongs in:

```text
client/src/components
```

---

# 🗄️ Database

Major collections include:

```text
users
roles
permissions
students
parents
teachers
staff
academicYears
classes
sections
subjects
attendance
exams
marks
results
fees
payments
expenses
salaries
leaves
books
bookIssues
assignments
notices
events
messages
notifications
documents
auditLogs
settings
```

Database relationships and indexing strategy are documented in:

```text
docs/DATABASE.md
```

---

# 📚 Documentation

Phase-specific documentation:

```text
docs/
├── PHASE-01.md
├── PHASE-02.md
├── PHASE-03.md
└── DATABASE.md
```

Development phases document:

- Architecture decisions
- Database changes
- API changes
- Security decisions
- UI/UX decisions
- Implementation notes

---

# 🎨 Design System

The application includes a living design system available during development:

```text
/app/design-system
```

It documents and demonstrates:

- Colors
- Typography
- Buttons
- Forms
- Cards
- Tables
- Dialogs
- Dropdowns
- Navigation
- States
- Responsive patterns

This keeps the interface consistent across the entire platform.

---

# 🧪 Testing

The project uses automated testing to protect core functionality.

Testing covers:

```text
Authentication
Authorization
Students
Teachers
Attendance
Exams
Results
Fees
Payments
Reports
Security
API validation
```

Run tests:

```bash
npm test
```

Type-check:

```bash
npm run typecheck
```

Production build:

```bash
npm run build
```

---

# 🚀 Production

Build the application:

```bash
npm run build
```

Start the server:

```bash
npm run start -w server
```

The production architecture supports:

```text
Static Frontend
       │
       ▼
Reverse Proxy / CDN
       │
       ▼
Express API
       │
       ▼
MongoDB
```

The frontend can be deployed separately while `/api` requests are forwarded to the backend.

---

# 🗺️ Development Roadmap

```text
[01] Project Foundation       ✅
[02] UI/UX Design System      ✅
[03] Database Architecture    ✅
[04] Authentication           ⬜
[05] RBAC & Permissions       ⬜
[06] Admin Dashboard          ⬜
[07] School Settings          ⬜
[08] Student Management       ⬜
[09] Parent Management        ⬜
[10] Teacher & Staff          ⬜
[11] Academic Management      ⬜
[12] Attendance               ⬜
[13] Class Routine             ⬜
[14] Assignments              ⬜
[15] Examination              ⬜
[16] Marks Management         ⬜
[17] Results                  ⬜
[18] Fees                     ⬜
[19] Payments                 ⬜
[20] Finance                  ⬜
[21] Payroll & Leave          ⬜
[22] Library                 ⬜
[23] Notices & Events         ⬜
[24] Communication            ⬜
[25] Documents                ⬜
[26] Reports                 ⬜
[27] ID Cards & Certificates  ⬜
[28] Security Hardening       ⬜
[29] Testing & Performance    ⬜
[30] Production Deployment    ⬜
```

---

# 🔒 Security Principles

This project follows several important security principles:

```text
Never trust the client
Never expose secrets
Never store plaintext passwords
Never trust user-supplied IDs
Never expose private files publicly
Never rely only on frontend authorization
Never log sensitive credentials
Always validate server-side
Always authorize resource access
Always audit sensitive actions
```

---

# 📈 Future Roadmap

Future versions may include:

- 📱 Progressive Web App
- 📲 Mobile application
- 🤖 AI student analytics
- 🤖 AI report generation
- 🤖 AI exam/question generator
- 💬 SMS integration
- 📧 Email automation
- 💳 Online payment gateway
- 🔔 Push notifications
- 📊 Advanced analytics
- 🌐 Multi-school SaaS architecture
- 🏢 Multi-tenant architecture

---

# 🤝 Contribution

Contributions are welcome.

Before submitting a pull request:

```bash
npm run typecheck
npm test
npm run build
```

Please keep changes:

- Focused
- Tested
- Documented
- Secure
- Consistent with the existing architecture

---

# 📄 License

This project is currently under development.

License information will be added before public production release.

---

<p align="center">

### 🎓 Built for Modern Education Management

**Secure • Scalable • Accessible • Data-Driven**

</p>

<p align="center">

⭐ If you find this project useful, consider giving it a star.

</p>
