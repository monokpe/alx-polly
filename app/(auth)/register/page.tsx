// This is a client component because it uses useState for local component state
// and handles form submissions directly in the browser.
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { register } from '@/app/lib/actions/auth-actions'; // Server Action for handling registration

/**
 * RegisterPage component.
 *
 * This component provides the user interface for registering a new account in the ALX Polly application.
 * It's a client-side component responsible for collecting user details (name, email, password,
 * and password confirmation) and submitting them to the `register` Server Action for account creation.
 *
 * Why it's needed:
 * - **User Onboarding**: Allows new users to create an account and join the platform,
 *   expanding the user base.
 * - **Data Validation**: Performs client-side validation for password matching before
 *   sending data to the server, improving user experience by providing immediate feedback.
 * - **Secure Account Creation**: Utilizes a Server Action to securely process registration,
 *   leveraging server-side logic for interacting with Supabase.
 *
 * Assumptions:
 * - The `register` Server Action (from '@/app/lib/actions/auth-actions') handles the actual
 *   account creation logic with Supabase and returns an object with either an `error` message
 *   or a successful response.
 * - Upon successful registration, the user should be redirected to '/polls'.
 * - Tailwind CSS and `shadcn/ui` components are available for styling and UI elements.
 *
 * Edge Cases:
 * - **Password Mismatch**: Client-side validation catches this immediately and displays an error.
 * - **Email Already Exists**: The `register` Server Action will return an error (e.g., from Supabase),
 *   which is then displayed to the user.
 * - **Network Issues**: Similar to login, potential network issues might lead to generic errors
 *   or extended loading states if not explicitly handled within the Server Action.
 * - **Browser Reload**: A full page reload (`window.location.href`) is used after successful
 *   registration to ensure the Next.js App Router's cache is cleared and the new session is fully
 *   recognized by all Server Components.
 *
 * Connects to:
 * - `auth-actions.ts` (register Server Action): Handles the backend account creation logic.
 * - `AuthLayout` (parent component): Provides the overall structure and redirects if already logged in.
 * - `login/page.tsx`: Provides a link to the login page for existing users.
 * - `shadcn/ui` components (Card, Input, Button, Label): For building the user interface.
 */
export default function RegisterPage() {
  // State to manage and display registration errors.
  const [error, setError] = useState<string | null>(null);
  // State to manage the loading status of the registration process,
  // used to disable the submit button and show loading text.
  const [loading, setLoading] = useState(false);

  /**
   * Handles the form submission for the registration process.
   * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission behavior
    setLoading(true); // Set loading to true when submission starts
    setError(null); // Clear any previous errors

    // Extract form data from the event target.
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Client-side validation: Check if passwords match.
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false); // Reset loading state
      return; // Stop the submission process
    }

    // Call the server action to attempt user registration.
    const result = await register({ name, email, password });

    // Handle the result from the server action.
    if (result?.error) {
      setError(result.error); // Display error message if registration fails
      setLoading(false); // Reset loading state
    } else {
      // On successful registration, perform a full page reload to ensure the new session is picked up
      // by all components, especially server components that might rely on authentication state.
      window.location.href = '/polls'; 
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Sign up to start creating and sharing polls</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name"
                type="text" 
                placeholder="John Doe" 
                required
              />
            </div>
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
                autoComplete="new-password" // Auto-fill for better user experience
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword"
                type="password" 
                required
                autoComplete="new-password" // Auto-fill for better user experience
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>} {/* Display error message */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register'} {/* Change button text based on loading state */}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login {/* Link to the login page */}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}