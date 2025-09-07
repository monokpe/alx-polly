"use client";

import Link from "next/link";
import { useAuth } from "@/app/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { deletePoll } from "@/app/lib/actions/poll-actions";

/**
 * @interface Poll
 * @description Defines the shape of a poll object required by the PollActions component.
 */
interface Poll {
  id: string;
  question: string;
  options: any[];
  user_id: string;
}

/**
 * @interface PollActionsProps
 * @description Defines the props for the PollActions component.
 */
interface PollActionsProps {
  poll: Poll;
}

/**
 * Renders a card for a single poll with conditional actions.
 *
 * @description This component encapsulates the display and management logic for an individual poll
 * within a list (e.g., on the main polls page). The entire card links to the poll's detail page.
 * It conditionally renders "Edit" and "Delete" buttons based on whether the currently
 * logged-in user is the owner of the poll.
 *
 * @param {PollActionsProps} { poll } - The poll object to be rendered.
 *
 * @assumptions It receives a `poll` object with a specific structure. The `useAuth` context is
 * available to identify the current user and check for ownership.
 *
 * @edgeCases
 * - The `user` object from `useAuth` might be null or loading, but the parent `DashboardLayout`
 *   should prevent this component from rendering in such a state.
 * - The delete action could fail on the server. The current implementation reloads the page,
 *   which is a simple approach but could be improved to show an error toast.
 *
 * @returns {JSX.Element} A component displaying a poll card with actions.
 */
export default function PollActions({ poll }: PollActionsProps) {
  // Get the current user from the authentication context.
  const { user } = useAuth();

  /**
   * Handles the deletion of the poll.
   * @description Prompts the user for confirmation before calling the `deletePoll` server action.
   * On success, it reloads the page to reflect the updated list of polls.
   */
  const handleDelete = async () => {
    // A simple confirmation dialog to prevent accidental deletion.
    if (confirm("Are you sure you want to delete this poll?")) {
      await deletePoll(poll.id);
      // Reload the page to refresh the poll list.
      window.location.reload();
    }
  };

  return (
    <div className="border rounded-md shadow-md hover:shadow-lg transition-shadow bg-white">
      {/* The main body of the card is a link to the poll's detail page. */}
      <Link href={`/polls/${poll.id}`}>
        <div className="group p-4">
          <div className="h-full">
            <div>
              <h2 className="group-hover:text-blue-600 transition-colors font-bold text-lg">
                {poll.question}
              </h2>
              <p className="text-slate-500">{poll.options.length} options</p>
            </div>
          </div>
        </div>
      </Link>
      {/* Conditionally render the action buttons only if the logged-in user is the poll's creator. */}
      {user && user.id === poll.user_id && (
        <div className="flex gap-2 p-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/polls/${poll.id}/edit`}>Edit</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
