"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  deletePoll,
  getAllPollsForAdmin,
} from "@/app/lib/actions/poll-actions";

/**
 * @interface Poll
 * @description Defines the shape of a poll object used within the AdminPage.
 * @property {string} id - The unique identifier for the poll.
 * @property {string} question - The question text of the poll.
 * @property {string} user_id - The ID of the user who created the poll.
 * @property {string} created_at - The timestamp of when the poll was created.
 * @property {string[]} options - An array of strings representing the poll's options.
 */
interface Poll {
  id: string;
  question: string;
  user_id: string;
  created_at: string;
  options: string[];
}

/**
 * Renders the admin panel, which displays a list of all polls in the system.
 *
 * @description This component provides a centralized place for administrators to monitor and manage all
 * user-created polls, ensuring content quality and system integrity. It's a critical view for moderation.
 *
 * @assumptions The user accessing this page has administrative privileges, which should be enforced by a
 * higher-level component or middleware. The `getAllPollsForAdmin` and `deletePoll` server actions are
 * assumed to handle their own authorization logic internally.
 *
 * @edgeCases
 * - No polls exist in the system, in which case a message is displayed.
 * - The fetch request for polls fails.
 * - A delete operation fails on the server.
 * - The list of polls is very large (pagination is not implemented).
 *
 * @returns {JSX.Element} The admin page component.
 */
export default function AdminPage() {
  // State to hold the list of all polls.
  const [polls, setPolls] = useState<Poll[]>([]);
  // State to manage the loading status while fetching initial data.
  const [loading, setLoading] = useState(true);
  // State to track which poll is currently being deleted to show loading feedback.
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Effect to fetch all polls when the component mounts.
  useEffect(() => {
    /**
     * @async
     * @function fetchAllPolls
     * @description Fetches all polls from the backend and updates the component's state.
     * This is called once when the component mounts to populate the admin panel.
     */
    const fetchAllPolls = async () => {
      const { polls, error } = await getAllPollsForAdmin();
      if (!error && polls) {
        setPolls(polls);
      }
      // Stop the loading indicator regardless of success or failure.
      setLoading(false);
    };
    fetchAllPolls();
  }, []); // Empty dependency array ensures this runs only once on mount.

  /**
   * Handles the deletion of a poll.
   *
   * @description This function is called when an admin clicks the "Delete" button. It sets a loading
   * state for the specific poll, calls the `deletePoll` server action, and then updates the UI by
   * removing the poll from the state if the deletion was successful.
   *
   * @param {string} pollId - The ID of the poll to be deleted.
   */
  const handleDelete = async (pollId: string) => {
    // Set loading state for the specific poll being deleted.
    setDeleteLoading(pollId);
    const result = await deletePoll(pollId);

    // If deletion was successful, update the UI by filtering out the deleted poll.
    if (!result.error) {
      setPolls(polls.filter((poll) => poll.id !== pollId));
    }

    // Reset the delete loading state.
    setDeleteLoading(null);
  };

  // Display a loading message while fetching the initial list of polls.
  if (loading) {
    return <div className="p-6">Loading all polls...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-gray-600 mt-2">
          View and manage all polls in the system.
        </p>
      </div>

      <div className="grid gap-4">
        {/* Map through the polls and render a card for each one. */}
        {polls.map((poll) => (
          <Card key={poll.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{poll.question}</CardTitle>
                  <CardDescription>
                    <div className="space-y-1 mt-2">
                      <div>
                        Poll ID:{" "}
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {poll.id}
                        </code>
                      </div>
                      <div>
                        Owner ID:{" "}
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {poll.user_id}
                        </code>
                      </div>
                      <div>
                        Created:{" "}
                        {new Date(poll.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardDescription>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(poll.id)}
                  disabled={deleteLoading === poll.id}
                >
                  {/* Show different button text based on the delete loading state. */}
                  {deleteLoading === poll.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium">Options:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {poll.options.map((option, index) => (
                    <li key={index} className="text-gray-700">
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Display a message if there are no polls in the system. */}
      {polls.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No polls found in the system.
        </div>
      )}
    </div>
  );
}
