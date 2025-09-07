import { getPollById } from '@/app/lib/actions/poll-actions';
import { notFound } from 'next/navigation';
import EditPollForm from './EditPollForm';

/**
 * The page component for editing a specific poll.
 *
 * @description This is a server component that acts as the entry point for the poll editing page.
 * Its primary responsibility is to fetch the specific poll's data from the server based on the
 * dynamic ID in the URL. By being a server component, it can securely and efficiently fetch data
 * before rendering the page, separating the data-fetching concern from the interactive form logic.
 *
 * @param {{ params: { id: string } }} { params } - The route parameters, containing the poll's ID.
 *
 * @assumptions The `params.id` from the URL corresponds to a valid poll ID. The `getPollById`
 * action will return an error or a null poll if it doesn't exist or if there's a database issue.
 *
 * @edgeCases
 * - The poll ID from the URL does not correspond to an existing poll. In this case, the `notFound()`
 *   function from Next.js is called to render a standard 404 page.
 * - The `getPollById` action fails for other reasons (e.g., database connection error).
 *
 * @returns {Promise<JSX.Element>} A promise that resolves to the edit poll page component.
 */
export default async function EditPollPage({ params }: { params: { id: string } }) {
  // Fetch the specific poll using the ID from the URL parameters.
  const { poll, error } = await getPollById(params.id);

  // If there was an error fetching the poll or the poll doesn't exist, show a 404 page.
  if (error || !poll) {
    notFound();
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Poll</h1>
      {/*
        Render the client component `EditPollForm` and pass the fetched poll data as a prop.
        This is a standard pattern for server components to provide initial data to client components.
      */}
      <EditPollForm poll={poll} />
    </div>
  );
}