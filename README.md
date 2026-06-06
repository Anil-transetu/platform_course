# LMS Admin Dashboard - Frontend

A professional, responsive Learning Management System (LMS) Admin Dashboard built with Next.js 15, TypeScript, and Tailwind CSS. This frontend is fully integrated with a Node.js/Sequelize backend to manage users, students, institutions, and more.

## 🚀 Project Overview

This platform provides a centralized hub for administrators to oversee educational operations. It features a modern, clean UI for managing students, user accounts, and institutions with real-time data synchronization and robust error handling.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management & Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validation**: Custom validation logic in `lib/validation.ts`

## ⚙️ Setup and Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/prasanthi-transetu/platform_course.git
   cd platform_course
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env.local` file in the root directory and add your backend URL:
   ```env
   NEXT_PUBLIC_API_URL=https://lms-backend-n83k.onrender.com
   ```

## 🏃 Running the Project Locally

To start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔗 Backend Integration Details

- **Base API URL**: `https://lms-backend-n83k.onrender.com/api/v1`
- **Authentication**: Uses Bearer Token authentication. The frontend extracts the `token` from cookies and forwards it in the `Authorization` header.
- **Data Fetching Strategy**: 
    - **TanStack Query** is used for student operations to provide automatic caching, background updates, and seamless state management.
    - **Native Fetch API** is used within Next.js API proxy routes to securely communicate with the backend.

## ✨ Implemented Features (CRUD)

### 👥 Student Management
- **Read**: View paginated list of students with search and filters (Status, Course ID).
- **Create**: Add new students via a multi-step modal.
- **Update**: Edit existing student details and enrollment status.
- **Delete**: Securely remove student records with confirmation.
- **Bulk Upload**: Import multiple students at once using CSV files.

### 👤 User Management
- **Read**: Oversee administrators and institution representatives.
- **Create**: Register new administrative users with specific roles.
- **Real-time Mapping**: Automatically maps backend `full_name` and `email` for display.

### 🏫 Institution Management
- **Read/Write**: Manage educational units and their contact information.
- **Authenticated Proxy**: Securely forwards credentials to the backend via Next.js routes.

## 📂 Folder Structure

```text
├── app/                  # Next.js App Router (Pages and API Routes)
│   ├── admin/            # Administrative pages (Dashboard, Students, Users)
│   ├── api/              # Local API proxy routes for backend communication
│   └── login/            # Authentication pages
├── components/           # Reusable UI components
│   ├── layouts/          # Layout wrappers
│   ├── providers/        # Context providers (e.g., QueryProvider)
│   └── sidebar/          # Navigation and modal components
├── features/             # Domain-specific logic and API helpers
│   ├── students/         # Student API hooks and functions
│   ├── users/            # User API functions
│   └── institutions/     # Institution API functions
├── lib/                  # Shared utilities and validation logic
├── public/               # Static assets (images, icons)
└── styles/               # Global CSS and Tailwind configurations
```

## ⚠️ Important Notes

- **CORS**: Cross-Origin Resource Sharing is handled entirely on the **Backend**. No additional configuration is required on the frontend.
- **Authorization**: Always ensure you are logged in to access administrative routes. The `middleware.ts` handles route protection.
- **Backend Availability**: The frontend depends on the deployed backend URL. If the backend is down, some features may display error messages.

---
Developed by [Prasanthi Transetu](https://github.com/prasanthi-transetu)
