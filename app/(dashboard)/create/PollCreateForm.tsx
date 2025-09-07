"use client";

import { useState } from "react";
import { createPoll } from "@/app/lib/actions/poll-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Renders a form for creating a new poll.
 *
 * @description This component provides the primary user interface for content creation in the application.
 * It allows authenticated users to create a new poll by providing a question and at least two options.
 * It handles its own state for dynamic options, error messages, and success feedback.
 *
 * @assumptions The user is authenticated. The `createPoll` server action handles data validation
 * (e.g., ensuring the question is not empty, there are at least two non-empty options) and associates
 * the created poll with the currently logged-in user.
 *
 * @edgeCases
 * - User tries to submit with fewer than two options (UI prevents this).
 * - User submits empty options (client-side `required` attribute helps, but server-side validation is key).
 * - The `createPoll` action fails, in which case an error message is displayed.
 *
 * @returns {JSX.Element} The poll creation form component.
 */
export default function PollCreateForm() {
  // State to manage the dynamic list of poll options. Starts with two empty options.
  const [options, setOptions] = useState(["", ""]);
  // State to hold any error message returned from the server action.
  const [error, setError] = useState<string | null>(null);
  // State to indicate a successful poll creation, used to show a success message.
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
  const addOption = () => setOptions((opts) => [...opts, ""]);

  /**
   * Removes an option field from the form, ensuring at least two options remain.
   * @param {number} idx - The index of the option to remove.
   */
  const removeOption = (idx: number) => {
    // The UI enforces a minimum of two options.
    if (options.length > 2) {
      setOptions((opts) => opts.filter((_, i) => i !== idx));
    }
  };

  return (
    <form
      // This form uses a server action (`createPoll`) for submission.
      action={async (formData) => {
        // Reset states before the new submission.
        setError(null);
        setSuccess(false);

        // Call the server action with the form data.
        const res = await createPoll(formData);

        // If the server action returns an error, display it.
        if (res?.error) {
          setError(res.error);
        } else {
          // On success, show a success message and redirect after a short delay.
          setSuccess(true);
          setTimeout(() => {
            window.location.href = "/polls";
          }, 1200);
        }
      }}
      className="space-y-6 max-w-md mx-auto"
    >
      <div>
        <Label htmlFor="question">Poll Question</Label>
        <Input name="question" id="question" required />
      </div>
      <div>
        <Label>Options</Label>
        {/* Map through the options state to render an input for each one. */}
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <Input
              name="options" // All option inputs share the same name.
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              required
            />
            {/* Only show the "Remove" button if there are more than two options. */}
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

      {/* Display server-side error message if it exists. */}
      {error && <div className="text-red-500">{error}</div>}
      {/* Display success message before redirecting. */}
      {success && <div className="text-green-600">Poll created! Redirecting...</div>}

      <Button type="submit">Create Poll</Button>
    </form>
  );
} 