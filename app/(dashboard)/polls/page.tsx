import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getUserPolls } from '@/app/lib/actions/poll-actions';
import PollActions from './PollActions'; 

/**
 * Renders the main "My Polls" page for an authenticated user.
 *
 * @description This server component serves as the user's personal dashboard within the application.
 * It fetches and displays a list of all polls created by the currently authenticated user.
 * It provides a clear overview of their content and easy access to create new polls.
 *
 * @assumptions The `getUserPolls` server action correctly identifies the logged-in user (likely from
 * a session cookie managed by Supabase) and fetches only their polls from the database.
 *
 * @edgeCases
 * - The user has not created any polls yet. A helpful message and a call-to-action button are
 *   displayed to guide them.
 * - The `getUserPolls` action fails on the server, in which case an error message is rendered at the
 *   bottom of the page.
 *
 * @returns {Promise<JSX.Element>} A promise that resolves to the user's polls page component.
 */
export default async function PollsPage() {
  // Fetch the polls for the current user on the server.
  const { polls, error } = await getUserPolls();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Polls</h1>
        <Button asChild>
          <Link href="/create">Create New Poll</Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Check if polls were fetched successfully and if there are any polls to display. */}
        {polls && polls.length > 0 ? (
          // If there are polls, map over them and render a PollActions component for each one.
          polls.map((poll) => <PollActions key={poll.id} poll={poll} />)
        ) : (
          // If there are no polls, display a message prompting the user to create one.
          <div className="flex flex-col items-center justify-center py-12 text-center col-span-full">
            <h2 className="text-xl font-semibold mb-2">No polls yet</h2>
            <p className="text-slate-500 mb-6">Create your first poll to get started</p>
            <Button asChild>
              <Link href="/create">Create New Poll</Link>
            </Button>
          </div>
        )}
      </div>
      {/* If there was an error fetching the polls, display it. */}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}