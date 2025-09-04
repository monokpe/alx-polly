// GET ALL POLLS (ADMIN ONLY)
export async function getAllPollsForAdmin() {
  const supabase = await createClient();
  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) return { polls: [], error: userError.message };
  if (!user) return { polls: [], error: "Not authenticated" };
  // Check for admin role in user metadata
  if (user.user_metadata?.role !== "admin") {
    return { polls: [], error: "Unauthorized: Admins only." };
  }
  // Fetch all polls
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return { polls: [], error: error.message };
  return { polls: data ?? [], error: null };
}
("use server");

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// CREATE POLL
export async function createPoll(formData: FormData) {
  const supabase = await createClient();

  let question = ((formData.get("question") as string) || "").trim();
  let options = formData
    .getAll("options")
    .map((opt) => (typeof opt === "string" ? opt.trim() : ""))
    .filter(Boolean) as string[];

  // Input validation
  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }
  if (question.length < 5 || question.length > 200) {
    return { error: "Question must be between 5 and 200 characters." };
  }
  if (options.some((opt) => opt.length < 1 || opt.length > 100)) {
    return { error: "Each option must be between 1 and 100 characters." };
  }
  // Optionally escape question/options to prevent injection (basic)
  question = question.replace(/[<>"'`]/g, "");
  options = options.map((opt) => opt.replace(/[<>"'`]/g, ""));

  // Get user from session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to create a poll." };
  }

  const { error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question,
      options,
    },
  ]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/polls");
  return { error: null };
}

// GET USER POLLS
export async function getUserPolls() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { polls: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { polls: [], error: error.message };
  return { polls: data ?? [], error: null };
}

// GET POLL BY ID
export async function getPollById(id: string) {
  const supabase = await createClient();
  // Fetch poll and check if it's private
  const { data: poll, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return { poll: null, error: error.message };

  // If poll is private, only allow owner to access
  if (poll?.private) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.id !== poll.user_id) {
      return { poll: null, error: "Unauthorized access to private poll." };
    }
  }
  return { poll, error: null };
}

// SUBMIT VOTE
export async function submitVote(pollId: string, optionIndex: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch poll to check end date and settings
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("endDate, settings")
    .eq("id", pollId)
    .single();
  if (pollError) return { error: pollError.message };

  // Enforce poll end date
  if (poll?.endDate && new Date() > new Date(poll.endDate)) {
    return { error: "Voting for this poll has ended." };
  }

  // Prevent double voting for authenticated users
  if (user) {
    const { data: existingVote, error: voteError } = await supabase
      .from("votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .single();
    if (!voteError && existingVote) {
      return { error: "You have already voted in this poll." };
    }
  }

  // Prevent double voting for anonymous users by IP (optional, not implemented here)

  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user?.id ?? null,
      option_index: optionIndex,
    },
  ]);

  if (error) return { error: error.message };
  return { error: null };
}

// DELETE POLL
export async function deletePoll(id: string) {
  const supabase = await createClient();
  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) return { error: userError.message };
  if (!user) return { error: "Not authenticated" };
  // Fetch poll to check ownership
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("user_id")
    .eq("id", id)
    .single();
  if (pollError) return { error: pollError.message };
  // Only allow owner or admin
  const isAdmin = user.user_metadata?.role === "admin";
  if (!isAdmin && poll.user_id !== user.id) {
    return {
      error:
        "Unauthorized: Only the poll owner or an admin can delete this poll.",
    };
  }
  const { error } = await supabase.from("polls").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/polls");
  return { error: null };
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
