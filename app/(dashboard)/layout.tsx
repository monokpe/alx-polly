"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/lib/context/auth-context";

/**
 * A protected layout for the dashboard area.
 *
 * @description This component wraps all pages within the `(dashboard)` route group. It is crucial for
 * application security and user experience. It centralizes authentication logic by checking if a user
 * is logged in. If not, it redirects them to the login page. It also provides a consistent UI
 * (header, navigation, footer) for the entire authenticated section of the app.
 *
 * @param {{ children: ReactNode }} { children } - The child components to be rendered within the layout.
 *
 * @assumptions The `AuthProvider` is available in a parent component (likely the root layout),
 * providing the `useAuth` context with user session information.
 *
 * @edgeCases
 * - The authentication state is loading. A "Loading..." message is shown to prevent flicker or premature redirects.
 * - The user is not authenticated. They are programmatically redirected to the `/login` page.
 *
 * @returns {JSX.Element | null} The dashboard layout with header, footer, and protected content, or null if not authenticated.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  // useAuth hook provides user session data, sign-out functionality, and loading state.
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  // This effect is the core of the route protection.
  useEffect(() => {
    // If the session is no longer loading and there is no user, redirect to login.
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]); // Reruns whenever user, loading, or router changes.

  /**
   * Handles the user sign-out process.
   * @description Calls the `signOut` method from the auth context and then redirects the user to the login page.
   * This ensures a clean session termination and navigation.
   */
  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  // While checking for the user session, display a loading indicator.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p>Loading user session...</p>
      </div>
    );
  }

  // If there's no user, return null to render nothing while the redirect happens.
  if (!user) {
    return null;
  }

  // If the user is authenticated, render the full dashboard layout.
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/polls" className="text-xl font-bold text-slate-800">
            ALX Polly
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/polls" className="text-slate-600 hover:text-slate-900">
              My Polls
            </Link>
            <Link
              href="/create"
              className="text-slate-600 hover:text-slate-900"
            >
              Create Poll
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button asChild>
              <Link href="/create">Create Poll</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        user?.user_metadata?.avatar_url ||
                        "/placeholder-user.jpg"
                      }
                      alt={user?.email || "User"}
                    />
                    <AvatarFallback>
                      {/* Display the first letter of the user's email as a fallback. */}
                      {user?.email ? user.email[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile" className="w-full">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings" className="w-full">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      {/* The main content of the page is rendered here. */}
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      <footer className="border-t bg-white py-4">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} ALX Polly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
