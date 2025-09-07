'use client';

import PollCreateForm from "./PollCreateForm";

/**
 * Renders the page for creating a new poll.
 *
 * @description This component serves as the main page for the `/create` route. It acts as a container
 * and entry point for the poll creation feature, providing a clear route and structure. It renders
 * the actual form component which contains all the interactive logic.
 *
 * @assumptions This page is protected and only accessible to authenticated users, as enforced by the
 * `DashboardLayout` which wraps this page component.
 *
 * @connections
 * - Renders the `PollCreateForm` component, which contains the form and logic for poll creation.
 * - This page is a child of `DashboardLayout`, inheriting the standard page structure (header, footer, etc.).
 *
 * @returns {JSX.Element} The create poll page component.
 */
export default function CreatePollPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Create a New Poll</h1>
      {/* The actual form with its logic is encapsulated in this component. */}
      <PollCreateForm />
    </main>
  );
}