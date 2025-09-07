'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for a single poll. In a real application, this would be fetched from a server.
const mockPoll = {
  id: '1',
  title: 'Favorite Programming Language',
  description: 'What programming language do you prefer to use?',
  options: [
    { id: '1', text: 'JavaScript', votes: 15 },
    { id: '2', text: 'Python', votes: 12 },
    { id: '3', text: 'Java', votes: 8 },
    { id: '4', text: 'C#', votes: 5 },
    { id: '5', text: 'Go', votes: 2 },
  ],
  totalVotes: 42,
  createdAt: '2023-10-15',
  createdBy: 'John Doe',
};

/**
 * Renders the detailed view of a single poll.
 *
 * @description This is the core interactive page where the primary purpose of the app—voting on polls—takes place.
 * It provides two distinct views: one for casting a vote and another for displaying the results after a vote has been cast.
 *
 * @param {{ params: { id: string } }} { params } - The route parameters, containing the poll's ID.
 *
 * @assumptions
 * - **CURRENTLY USES MOCK DATA.** In a real application, it would fetch live poll data based on `params.id`.
 * - A user can only vote once. The logic for preventing multiple votes (e.g., checking against a database record)
 *   is only simulated by the `hasVoted` state and would need a proper backend implementation.
 *
 * @edgeCases
 * - The poll ID is invalid (not currently handled as it uses mock data).
 * - The voting API call fails. This is simulated with `setTimeout`, but in a real app, this would require robust error handling.
 *
 * @returns {JSX.Element} The poll detail page component.
 */
export default function PollDetailPage({ params }: { params: { id: string } }) {
  // State to track the user's selected option before voting.
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  // State to toggle between the voting view and the results view.
  const [hasVoted, setHasVoted] = useState(false);
  // State to manage the loading indicator on the submit button during the vote submission.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In a real app, you would fetch the poll data based on the `params.id`.
  // For now, we are using mock data.
  const poll = mockPoll;
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  /**
   * Handles the vote submission process.
   * @description Simulates an API call to submit the user's vote. It sets a loading state during
   * the submission and then transitions the UI to the results view upon completion.
   */
  const handleVote = () => {
    if (!selectedOption) return;
    
    setIsSubmitting(true);
    
    // Simulate an API call with a timeout.
    setTimeout(() => {
      setHasVoted(true);
      setIsSubmitting(false);
    }, 1000);
  };

  /**
   * Calculates the percentage of votes for a given option.
   * @param {number} votes - The number of votes for a specific option.
   * @returns {number} The percentage of total votes.
   */
  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/polls" className="text-blue-600 hover:underline">
          &larr; Back to Polls
        </Link>
        <div className="flex space-x-2">
          {/* These actions would typically be conditional based on user ownership of the poll. */}
          <Button variant="outline" asChild>
            <Link href={`/polls/${params.id}/edit`}>Edit Poll</Link>
          </Button>
          <Button variant="outline" className="text-red-500 hover:text-red-700">
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{poll.title}</CardTitle>
          <CardDescription>{poll.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Conditional rendering: show voting options if user hasn't voted, otherwise show results. */}
          {!hasVoted ? (
            <div className="space-y-3">
              {poll.options.map((option) => (
                <div 
                  key={option.id} 
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedOption === option.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`}
                  onClick={() => setSelectedOption(option.id)}
                >
                  {option.text}
                </div>
              ))}
              <Button 
                onClick={handleVote} 
                disabled={!selectedOption || isSubmitting} 
                className="mt-4"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Vote'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium">Results:</h3>
              {poll.options.map((option) => (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{option.text}</span>
                    <span>{getPercentage(option.votes)}% ({option.votes} votes)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    {/* The progress bar representing the vote percentage. */}
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${getPercentage(option.votes)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              <div className="text-sm text-slate-500 pt-2">
                Total votes: {totalVotes}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-slate-500 flex justify-between">
          <span>Created by {poll.createdBy}</span>
          <span>Created on {new Date(poll.createdAt).toLocaleDateString()}</span>
        </CardFooter>
      </Card>

      {/* A section for sharing the poll. */}
      <div className="pt-4">
        <h2 className="text-xl font-semibold mb-4">Share this poll</h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1">
            Copy Link
          </Button>
          <Button variant="outline" className="flex-1">
            Share on Twitter
          </Button>
        </div>
      </div>
    </div>
  );
}