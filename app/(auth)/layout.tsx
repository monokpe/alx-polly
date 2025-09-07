// This is a client component, necessary for using hooks like useRouter and useAuth.
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/context/auth-context';

/**
 * @typedef {Object} AuthLayoutProps
 * @property {ReactNode} children - The child components to be rendered within the authentication layout.
 */

/**
 * AuthLayout component.
 *
 * This layout component wraps all authentication-related pages (e.g., login, register).
 * Its primary responsibility is to check the user's authentication status and redirect
 * authenticated users away from the authentication pages to the main application
 * (e.g., '/polls'). It also provides a consistent header and footer for auth pages.
 *
 * Why it's needed:
 * - **Guards Authenticated Routes**: Prevents logged-in users from accessing login/register pages,
 *   enhancing UX and security by ensuring they are directed to relevant content.
 * - **Consistent UI**: Provides a unified look and feel for all authentication forms.
 * - **Centralized Auth State Check**: Leverages the `useAuth` hook to access global
 *   authentication state, making decisions based on `user` and `loading` status.
 *
 * Assumptions:
 * - A `useAuth` hook is available at '@/app/lib/context/auth-context' that provides
 *   `user` (the authenticated user object or null) and `loading` (boolean indicating
 *   if auth state is still being determined).
 * - Authenticated users should be redirected to '/polls'.
 * - Unauthenticated users should see the login/register forms within this layout.
 *
 * Edge Cases:
 * - **Initial Load**: During the initial load (`loading` is true), a loading indicator
 *   is displayed to prevent flickering or premature redirects.
 * - **User Logs Out**: If a user logs out while on a protected page, the `useAuth`
 *   context will update, and if they then try to navigate back to `/login` or `/register`
 *   they will be correctly presented with the auth forms.
 *
 * Connects to:
 * - `useAuth` hook (`@/app/lib/context/auth-context`): Retrieves the current authentication state.
 * - `next/navigation` (useRouter): Used for programmatic navigation after authentication checks.
 * - Child components: Renders the actual login or registration forms as `children`.
 * - Global layout/styling: Integrates with Tailwind CSS for consistent styling across auth pages.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  // Destructure user and loading state from the authentication context.
  const { user, loading } = useAuth();
  // Initialize the Next.js router for navigation.
  const router = useRouter();

  /**
   * Effect hook to handle redirection based on authentication status.
   * This runs whenever 'user', 'loading', or 'router' dependencies change.
   */
  useEffect(() => {
    // If loading is complete and a user is authenticated, redirect to the polls page.
    if (!loading && user) {
      router.push('/polls');
    }
  }, [user, loading, router]); // Dependencies for the useEffect hook

  // Display a loading message while the authentication status is being determined.
  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner, to improve UX during initial auth check
  }

  // If a user is authenticated, return null as the useEffect will handle the redirect.
  // This prevents rendering the auth forms briefly before redirection.
  if (user) {
    return null; // Should already be redirected by useEffect
  }

  // If no user is authenticated and loading is complete, render the authentication layout.
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="py-4 px-6 border-b bg-white">
        <div className="container mx-auto flex justify-center">
          <h1 className="text-2xl font-bold text-slate-800">ALX Polly</h1>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children} {/* Renders the specific auth page (login/register) */}
      </main>
      <footer className="py-4 px-6 border-t bg-white">
        <div className="container mx-auto text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} ALX Polly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}