'use client';

import { useState } from 'react';
import { updatePoll } from '@/app/lib/actions/poll-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Renders a form to edit an existing poll.
 *
 * @description This component provides the core functionality for users to manage and update their
 * created polls. It's a client component that comes pre-populated with the existing poll's data
 * and handles the state management for the form fields and submission process.
 *
 * @param {{ poll: any }} { poll } - The poll object containing the data to be edited.
 *
 * @assumptions It receives a `poll` object as a prop. The `updatePoll` server action is responsible
 * for verifying that the current user has permission to edit this specific poll on the server-side.
 *
 * @edgeCases
 * - The `updatePoll` action fails (e.g., validation error, permission denied), in which case an error message is shown.
 * - The user tries to remove options, but the UI prevents going below a minimum of two.
 *
 * @returns {JSX.Element} The poll editing form.
 */
export default function EditPollForm({ poll }: { poll: any }) {
  // State for the poll question, initialized with the current poll's question.
  const [question, setQuestion] = useState(poll.question);
  // State for the poll options, initialized with the current poll's options.
  const [options, setOptions] = useState<string[]>(poll.options || []);
  // State to hold any error message from the server.
  const [error, setError] = useState<string | null>(null);
  // State to indicate a successful update.
  const [success, setSuccess] = useState(false);

  /**
   * Updates the value of a specific option in the state.
   * @param {number} idx - The index of the option to update.
   * @param {string} value - The new value for the option.
   */
  const handleOptionChange = (idx: number, value: string) => {
    setOptions((opts) => opts.map((opt, i) => (i === idx ? value : opt)));
  };

  /**
   * Adds a new, empty option field to the form.
   */
  const addOption = () => setOptions((opts) => [...opts, '']);

  /**
   * Removes an option field, ensuring at least two options remain.
   * @param {number} idx - The index of the option to remove.
   */
  const removeOption = (idx: number) => {
    if (options.length > 2) {
      setOptions((opts) => opts.filter((_, i) => i !== idx));
    }
  };

  return (
    <form
      // This form uses the `updatePoll` server action for submission.
      action={async (formData) => {
        // Reset states on new submission.
        setError(null);
        setSuccess(false);

        // Manually update formData with the current state values.
        // This is necessary because the `question` input is a controlled component.
        formData.set('question', question);
        // The options are also controlled, so we clear the default 'options' entry
        // and append the state values.
        formData.delete('options');
        options.forEach((opt) => formData.append('options', opt));

        // Call the server action with the poll's ID and the updated form data.
        const res = await updatePoll(poll.id, formData);

        if (res?.error) {
          // If the server returns an error, display it.
          setError(res.error);
        } else {
          // On success, show a success message and redirect to the polls list.
          setSuccess(true);
          setTimeout(() => {
            window.location.href = '/polls';
          }, 1200);
        }
      }}
      className="space-y-6"
    >
      <div>
        <Label htmlFor="question">Poll Question</Label>
        <Input
          name="question"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)} // Controlled input
          required
        />
      </div>
      <div>
        <Label>Options</Label>
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <Input
              name="options"
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)} // Controlled input
              required
            />
            {/* Only show remove button if there are more than 2 options. */}
            {options.length > 2 && (
              <Button type="button" variant="destructive" onClick={() => removeOption(idx)}>
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button type="button" onClick={addOption} variant="secondary">
          Add Option
        </Button>
      </div>

      {/* Display feedback messages. */}
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">Poll updated! Redirecting...</div>}

      <Button type="submit">Update Poll</Button>
    </form>
  );
}