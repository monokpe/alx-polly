# ALX Polly: A Polling Application

Welcome to ALX Polly, a full-stack polling application built with Next.js, TypeScript, and Supabase. This application allows users to create, share, and vote on polls in a secure and interactive environment.

## Project Overview

ALX Polly is a modern web application that provides a platform for users to create and participate in polls. It features a secure authentication system, a user-friendly dashboard for managing polls, and a real-time voting interface.

### Key Features:

- **Authentication**: Secure user sign-up and login using Supabase Auth.
- **Poll Management**: Authenticated users can create, view, edit, and delete their own polls.
- **User Dashboard**: A personalized space for users to see and manage all the polls they have created.
- **Voting System**: A simple and intuitive interface for users to cast their votes on polls.
- **Admin Panel**: A special view for administrators to see and manage all polls in the system.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database**: [Supabase](https://supabase.io/)
- **UI**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: React Server Components and Client Components with Context API for authentication state.

---

## Getting Started

Follow these steps to get the application running on your local machine.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A [Supabase](https://supabase.io/) account.

### 2. Setup Steps

**a. Clone the Repository**

```bash
git clone <repository-url>
cd alx-polly
```

**b. Install Dependencies**

```bash
npm install
```

**c. Set up Supabase**

1.  Go to your [Supabase Dashboard](https://app.supabase.io) and click on "New project".
2.  Give your project a name and a strong database password.
3.  After the project is created, navigate to the **Settings** > **API** page.
4.  You will find your **Project URL** and **Project API Keys** here. You will need the `URL` and the `anon` `public` key.

**d. Configure Environment Variables**

Create a new file named `.env.local` in the root of your project directory. Copy the contents of `.env.example` (if it exists) or add the following variables, replacing the placeholder values with your actual Supabase credentials from the previous step.

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 3. Running the Application Locally

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Usage

1.  **Register**: Create a new account from the `/register` page.
2.  **Login**: Sign in to your account from the `/login` page.
3.  **Create a Poll**: Once logged in, navigate to the `/create` page to create a new poll by adding a question and at least two options.
4.  **View Your Polls**: The `/polls` page will display all the polls you have created. From here you can edit or delete them.
5.  **Vote**: Click on any poll to go to its detail page where you can cast your vote. After voting, you will see the results.

## Testing

This project does not yet have an automated test suite. To run tests locally in the future, you would typically use a command like:

```bash
npm run test
```