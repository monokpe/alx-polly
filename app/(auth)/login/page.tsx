// This is a client component because it uses useState for local component state
// and handles form submissions directly in the browser.
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { login } from '@/app/lib/actions/auth-actions'; // Server Action for handling login

/**
 * LoginPage component.
 *
 * This component provides the user interface for logging into the ALX Polly application.
 * It's a client-side component responsible for collecting user credentials (email and password)
 * and submitting them to the `login` Server Action for authentication.
 *
 * Why it's needed:
 * - **User Access**: It's the primary gateway for existing users to access their accounts
 *   and interact with the application's features (creating polls, voting).
 * - **Secure Credential Submission**: Uses a Server Action to securely process login attempts,
 *   avoiding direct exposure of credentials to client-side API routes.
 * - **Feedback Mechanism**: Provides visual feedback (loading state, error messages) to the user
 *   during the login process.
 *
 * Assumptions:
 * - The `login` Server Action (from '@/app/lib/actions/auth-actions') handles the actual
 *   authentication logic with Supabase and returns an object with either an `error` message
 *   or a successful response.
 * - Upon successful login, the user should be redirected to '/polls'.
 * - Tailwind CSS and `shadcn/ui` components are available for styling and UI elements.
 *
 * Edge Cases:
 * - **Invalid Credentials**: The `login` Server Action will return an error, which is then
 *   displayed to the user.
 * - **Network Issues**: While not explicitly handled with a specific network error message,
 *   the `login` action would likely fail, and a generic error might be shown or the loading
 *   state might persist if the action itself doesn't return an error in such cases.
 * - **Browser Reload**: A full page reload (`window.location.href`) is used after successful
 *   login to ensure the Next.js App Router's cache is cleared and the new session is fully
 *   recognized by all Server Components.
 *
 * Connects to:
 * - `auth-actions.ts` (login Server Action): Handles the backend authentication logic.
 * - `AuthLayout` (parent component): Provides the overall structure and redirects if already logged in.
 * - `register/page.tsx`: Provides a link to the registration page for new users.
 * - `shadcn/ui` components (Card, Input, Button, Label): For building the user interface.
 */
export default function LoginPage() {
  // State to manage and display authentication errors.
  const [error, setError] = useState<string | null>(null);
  // State to manage the loading status of the login process,
  // used to disable the submit button and show loading text.
  const [loading, setLoading] = useState(false);

  /**
   * Handles the form submission for the login process.
   * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission behavior (page reload)
    setLoading(true); // Set loading to true when submission starts
    setError(null); // Clear any previous errors

    // Extract form data from the event target.
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Call the server action to attempt login.
    const result = await login({ email, password });

    // Handle the result from the server action.
    if (result?.error) {
      setError(result.error); // Display error message if login fails
      setLoading(false); // Reset loading state
    } else {
      // On successful login, perform a full page reload to ensure the new session is picked up
      // by all components, especially server components that might rely on authentication state.
      window.location.href = '/polls'; 
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login to ALX Polly</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="your@email.com" 
                required
                autoComplete="email" // Auto-fill for better user experience
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                required
                autoComplete="current-password" // Auto-fill for better user experience
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>} {/* Display error message */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'} {/* Change button text based on loading state */}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register {/* Link to the registration page */}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}