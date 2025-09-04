# ALX Polly: A Polling Application

Welcome to ALX Polly, a full-stack polling application built with Next.js, TypeScript, and Supabase. This project serves as a practical learning ground for modern web development concepts, with a special focus on identifying and fixing common security vulnerabilities.

## About the Application

ALX Polly allows authenticated users to create, share, and vote on polls. It's a simple yet powerful application that demonstrates key features of modern web development:

- **Authentication**: Secure user sign-up and login.
- **Poll Management**: Users can create, view, and delete their own polls.
- **Voting System**: A straightforward system for casting and viewing votes.
- **User Dashboard**: A personalized space for users to manage their polls.

The application is built with a modern tech stack:

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database**: [Supabase](https://supabase.io/)
- **UI**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: React Server Components and Client Components

---

## 🚀 The Challenge: Security Audit & Remediation

As a developer, writing functional code is only half the battle. Ensuring that the code is secure, robust, and free of vulnerabilities is just as critical. This version of ALX Polly has been intentionally built with several security flaws, providing a real-world scenario for you to practice your security auditing skills.

**Your mission is to act as a security engineer tasked with auditing this codebase.**

### Your Objectives:

1.  **Identify Vulnerabilities**:

    - Thoroughly review the codebase to find security weaknesses.
    - Pay close attention to user authentication, data access, and business logic.
    - Think about how a malicious actor could misuse the application's features.

2.  **Understand the Impact**:

    - For each vulnerability you find, determine the potential impact.Query your AI assistant about it. What data could be exposed? What unauthorized actions could be performed?

3.  **Propose and Implement Fixes**:
    - Once a vulnerability is identified, ask your AI assistant to fix it.
    - Write secure, efficient, and clean code to patch the security holes.
    - Ensure that your fixes do not break existing functionality for legitimate users.

### Where to Start?

A good security audit involves both static code analysis and dynamic testing. Here’s a suggested approach:

1.  **Familiarize Yourself with the Code**:

    - Start with `app/lib/actions/` to understand how the application interacts with the database.
    - Explore the page routes in the `app/(dashboard)/` directory. How is data displayed and managed?
    - Look for hidden or undocumented features. Are there any pages not linked in the main UI?

2.  **Use Your AI Assistant**:
    - This is an open-book test. You are encouraged to use AI tools to help you.
    - Ask your AI assistant to review snippets of code for security issues.
    - Describe a feature's behavior to your AI and ask it to identify potential attack vectors.
    - When you find a vulnerability, ask your AI for the best way to patch it.

---

## Getting Started

To begin your security audit, you'll need to get the application running on your local machine.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.io/) account (the project is pre-configured, but you may need your own for a clean slate).

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd alx-polly
npm install
```

### 3. Environment Variables

The project uses Supabase for its backend. An environment file `.env.local` is needed.Use the keys you created during the Supabase setup process.

### 4. Running the Development Server

Start the application in development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

Good luck, engineer! This is your chance to step into the shoes of a security professional and make a real impact on the quality and safety of this application. Happy hunting!

---

## Security Audit: Flaws & Remediation

### 1. Insecure Poll Access

- **Flaw:** Any user could access any poll by ID, including private polls.
- **Remedy:** Backend checks were added to restrict access to private polls. Only the poll owner can access private polls.

### 2. Lack of Admin Role Enforcement

- **Flaw:** The admin panel and related actions were accessible to any user, not just admins.
- **Remedy:** Backend role checks were implemented. Only users with an `admin` role in their metadata can access admin endpoints and actions.

### 3. Missing Ownership Checks for Edit/Delete

- **Flaw:** Any user could attempt to edit or delete any poll by crafting requests directly to the backend.
- **Remedy:** Backend checks now ensure only the poll owner or an admin can edit or delete a poll.

### 4. Double Voting and Voting After Poll End

- **Flaw:** Users could vote multiple times on the same poll, and could vote after the poll's end date.
- **Remedy:** Backend logic now prevents double voting and enforces poll end dates.

### 5. Weak Password Policy

- **Flaw:** No password strength requirements were enforced during registration.
- **Remedy:** Passwords must now be at least 8 characters and include uppercase, lowercase, a number, and a special character.

### 6. No Rate Limiting or CAPTCHA

- **Flaw:** No protection against brute-force or automated attacks on login and registration endpoints.
- **Remedy:** Simple in-memory rate limiting was added for demonstration. Placeholders for CAPTCHA integration were provided for future enhancement.

### 7. Insufficient Input Validation and Sanitization

- **Flaw:** User input was not thoroughly validated or sanitized, risking injection and malformed data.
- **Remedy:** Backend validation and basic sanitization were added for registration and poll creation (e.g., email format, string length, removal of dangerous characters).

---

### Recommendations for Production

- Use a distributed rate limiter (e.g., Redis) instead of in-memory for real deployments.
- Integrate a real CAPTCHA service (e.g., Google reCAPTCHA, hCaptcha) for login and registration.
- Regularly review and update dependencies for security patches.
- Consider logging and monitoring for suspicious activity.
- Ensure all environment variables (e.g., Supabase keys) are kept secret and never committed to version control.
- Review and test all authorization logic as business requirements evolve.

---

**Summary:**
All major security flaws discovered during the audit have been addressed. The codebase now enforces strong authentication, authorization, input validation, and basic rate limiting. Ongoing vigilance and regular reviews are recommended to maintain a secure application.
