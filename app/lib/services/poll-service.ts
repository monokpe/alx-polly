import { createClient } from "@/lib/supabase/server";
import { Poll, PollOption } from "../types";
import { AppError, handleError } from "../utils/error-utils";
import { v4 as uuidv4 } from "uuid";

export class PollService {
  static async getAll() {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("polls")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) throw new AppError(error.message);
      return data ?? [];
    } catch (error) {
      // handleError will always throw an AppError
      handleError(error);
    }
  }

  static async getAllForAdmin(userId: string) {
    try {
      const supabase = await createClient();

      // Verify admin role
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw new AppError(userError.message);
      if (!user) throw new AppError("Not authenticated", 401);
      if (user.user_metadata?.role !== "admin") {
        throw new AppError("Unauthorized: Admins only.", 403);
      }

      // Fetch polls
      const { data, error } = await supabase
        .from("polls")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) throw new AppError(error.message);
      return data ?? [];
    } catch (error) {
      // handleError will always throw an AppError
      handleError(error);
    }
  }

  static async getUserPolls() {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw new AppError(userError.message);
      if (!user) throw new AppError("Not authenticated", 401);

      const { data, error } = await supabase
        .from("polls")
        .select("*")
        .eq("createdBy", user.id)
        .order("createdAt", { ascending: false });

      if (error) throw new AppError(error.message);
      return data ?? [];
    } catch (error) {
      // handleError will always throw an AppError
      handleError(error);
    }
  }

  static async create(pollData: { question: string; options: string[] }) {
    try {
      // Validate and sanitize question
      if (!pollData.question?.trim()) {
        throw new AppError("Question is required", 400);
      }
      const sanitizedQuestion = pollData.question.trim();
      if (sanitizedQuestion.length < 3) {
        throw new AppError("Question must be at least 3 characters long", 400);
      }

      // Validate and sanitize options
      if (!Array.isArray(pollData.options)) {
        throw new AppError("Options must be an array", 400);
      }

      // Clean options: trim, remove empty, and deduplicate (case-insensitive)
      const cleanedOptions = [
        ...new Set(
          pollData.options
            .map((opt) => opt?.trim())
            .filter((opt) => opt && opt.length > 0)
            .map((opt) => opt.toLowerCase())
        ),
      ].map((opt) => opt.trim()); // Re-trim after all processing

      // Validate option constraints
      if (cleanedOptions.length < 2) {
        throw new AppError("At least 2 unique options are required", 400);
      }

      // Optional: Enforce per-option length limits
      const MAX_OPTION_LENGTH = 200;
      cleanedOptions.forEach((opt, index) => {
        if (opt.length > MAX_OPTION_LENGTH) {
          throw new AppError(
            `Option ${
              index + 1
            } exceeds maximum length of ${MAX_OPTION_LENGTH} characters`,
            400
          );
        }
      });

      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw new AppError(userError.message);
      if (!user) throw new AppError("Not authenticated", 401);

      const poll: Partial<Poll> = {
        title: sanitizedQuestion,
        description: "",
        options: cleanedOptions.map(
          (opt): PollOption => ({
            id: uuidv4(),
            text: opt,
            votes: 0,
          })
        ),
        createdBy: user.id,
        settings: {
          allowMultipleVotes: false,
          requireAuthentication: true,
        },
      };

      const { data, error } = await supabase
        .from("polls")
        .insert([poll])
        .select()
        .single();

      if (error) throw new AppError(error.message);
      return data;
    } catch (error) {
      // handleError will always throw an AppError
      handleError(error);
    }
  }

  static async getById(id: string) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("polls")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new AppError(error.message);
      return data;
    } catch (error) {
      // handleError will always throw an AppError
      handleError(error);
    }
  }

  static async submitVote(pollId: string, optionIndex: number) {
    try {
      // First validate optionIndex type before any async operations
      if (!Number.isInteger(optionIndex)) {
        throw new AppError("Option index must be an integer", 400);
      }

      const supabase = await createClient();

      // Get user from auth context
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw new AppError(authError.message, 401);

      // Check if poll exists and get its settings
      const poll = await this.getById(pollId);
      if (!poll) throw new AppError("Poll not found", 404);

      // Validate poll has options
      if (!Array.isArray(poll.options) || poll.options.length === 0) {
        throw new AppError("Poll has no options", 400);
      }

      // Validate option index range
      if (optionIndex < 0 || optionIndex >= poll.options.length) {
        throw new AppError(
          `Option index must be between 0 and ${poll.options.length - 1}`,
          400
        );
      }

      // Always check authentication first based on poll settings
      const requiresAuth = poll.settings?.requireAuthentication ?? true; // Default to requiring auth if not specified
      if (requiresAuth && !user) {
        throw new AppError("Authentication required to vote in this poll", 401);
      }

      // Check if poll has ended
      if (poll.endDate && new Date() > new Date(poll.endDate)) {
        throw new AppError("Voting for this poll has ended", 403);
      }

      // For authenticated users or if auth is required, check for duplicate votes
      if (!poll.settings?.allowMultipleVotes) {
        const { data: existingVotes, error: votesError } = await supabase
          .from("votes")
          .select("id")
          .match({ pollId, userId: user?.id })
          .limit(1);

        if (votesError) {
          throw new AppError("Failed to check existing votes", 500);
        }

        if (existingVotes && existingVotes.length > 0) {
          throw new AppError("You have already voted in this poll", 409);
        }
      }

      // Verify the selected option exists and has an ID
      const selectedOption = poll.options[optionIndex];
      if (!selectedOption || !selectedOption.id) {
        throw new AppError("Invalid poll option", 400);
      }

      // Determine the userId for the vote
      // If authentication is required, we must have a user.id
      // If authentication is not required, use user.id if available, otherwise null
      const voteUserId = requiresAuth ? user!.id : user?.id ?? null;

      // Insert the vote
      const { error: insertError } = await supabase.from("votes").insert([
        {
          pollId,
          userId: voteUserId,
          optionId: selectedOption.id,
        },
      ]);

      if (insertError) {
        // Handle potential unique constraint violations
        if (
          insertError.code === "23505" ||
          insertError.message?.includes("duplicate key") ||
          insertError.message?.includes("unique constraint")
        ) {
          throw new AppError("You have already voted in this poll", 409);
        }
        throw new AppError(
          `Failed to submit vote: ${insertError.message}`,
          500
        );
      }

      return true;
    } catch (error) {
      // handleError will always throw an AppError
      handleError(error);
    }
  }

  static async delete(id: string) {
    try {
      const supabase = await createClient();

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw new AppError(userError.message);
      if (!user) throw new AppError("Not authenticated", 401);

      // Fetch poll to check ownership
      const poll = await this.getById(id);
      if (!poll) throw new AppError("Poll not found");

      // Only allow owner or admin to delete
      if (poll.createdBy !== user.id && user.user_metadata?.role !== "admin") {
        throw new AppError(
          "Unauthorized: Only the poll owner or an admin can delete this poll.",
          403
        );
      }

      const { error } = await supabase.from("polls").delete().eq("id", id);

      if (error) throw new AppError(error.message);
      return true;
    } catch (error) {
      // handleError will always throw an AppError
      handleError(error);
    }
  }
}
