"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { PollService } from "../services/poll-service";
import { sanitizeInput } from "../utils/error-utils";
import { POLLS } from "../config/constants";

// CREATE POLL
export async function createPoll(formData: FormData) {
  try {
    let question = sanitizeInput((formData.get("question") as string) || "");
    let options = formData
      .getAll("options")
      .map((opt) => (typeof opt === "string" ? sanitizeInput(opt) : ""))
      .filter(Boolean) as string[];

    // Input validation
    if (!question || options.length < 2) {
      throw new Error("Please provide a question and at least two options.");
    }
    if (question.length < 5 || question.length > 200) {
      throw new Error("Question must be between 5 and 200 characters.");
    }
    if (options.some((opt) => opt.length < 1 || opt.length > 100)) {
      throw new Error("Each option must be between 1 and 100 characters.");
    }

    await PollService.create({ question, options });
    revalidatePath("/polls");
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

// GET USER POLLS
export async function getUserPolls() {
  try {
    const polls = await PollService.getUserPolls();
    return { polls, error: null };
  } catch (error: any) {
    return { polls: [], error: error.message };
  }
}

// GET ALL POLLS (ADMIN ONLY)
export async function getAllPollsForAdmin() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const polls = await PollService.getAllForAdmin(user.id);
    return { polls, error: null };
  } catch (error: any) {
    return { polls: [], error: error.message };
  }
}

// GET POLL BY ID
export async function getPollById(id: string) {
  try {
    const poll = await PollService.getById(id);
    return { poll, error: null };
  } catch (error: any) {
    return { poll: null, error: error.message };
  }
}

// SUBMIT VOTE
export async function submitVote(pollId: string, optionIndex: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await PollService.submitVote(pollId, optionIndex, user?.id);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

// DELETE POLL
export async function deletePoll(id: string) {
  try {
    await PollService.delete(id);
    revalidatePath("/polls");
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

// UPDATE POLL
export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  // Get user from session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to update a poll." };
  }
  // Fetch poll to check ownership
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("user_id")
    .eq("id", pollId)
    .single();
  if (pollError) return { error: pollError.message };
  // Only allow owner or admin
  const isAdmin = user.user_metadata?.role === "admin";
  if (!isAdmin && poll.user_id !== user.id) {
    return {
      error:
        "Unauthorized: Only the poll owner or an admin can update this poll.",
    };
  }
  const { error } = await supabase
    .from("polls")
    .update({ question, options })
    .eq("id", pollId);
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}
