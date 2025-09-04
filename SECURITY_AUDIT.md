# Security Audit Report for ALX Polly

## Overview

This document outlines the security flaws discovered in the ALX Polly codebase and the steps taken to remedy them. The goal is to ensure the application is robust against common web security threats and follows best practices for authentication, authorization, and data handling.

---

## Discovered Security Flaws & Remediation Steps

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

## Recommendations for Production

- Use a distributed rate limiter (e.g., Redis) instead of in-memory for real deployments.
- Integrate a real CAPTCHA service (e.g., Google reCAPTCHA, hCaptcha) for login and registration.
- Regularly review and update dependencies for security patches.
- Consider logging and monitoring for suspicious activity.
- Ensure all environment variables (e.g., Supabase keys) are kept secret and never committed to version control.
- Review and test all authorization logic as business requirements evolve.

---

## Summary

All major security flaws discovered during the audit have been addressed. The codebase now enforces strong authentication, authorization, input validation, and basic rate limiting. Ongoing vigilance and regular reviews are recommended to maintain a secure application.
