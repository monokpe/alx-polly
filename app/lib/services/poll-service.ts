import { createClient } from "@/lib/supabase/server";
import { Poll, PollOption } from "../types";
import { AppError, handleError } from "../utils/error-utils";

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
      throw handleError(error);
    }
  }
  
  static async getAllForAdmin(userId: string) {
    try {
      const supabase = await createClient();
      
      // Verify admin role
      const { data: { user }, error: userError } = await supabase.auth.getUser();
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
      throw handleError(error);
    }
  }

  static async getUserPolls() {
    try {
      const supabase = await createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
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
      throw handleError(error);
    }
  }
  
  static async create(pollData: { question: string; options: string[] }) {
    try {
      const supabase = await createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new AppError(userError.message);
      if (!user) throw new AppError("Not authenticated", 401);

      const poll: Partial<Poll> = {
        title: pollData.question,
        description: "",
        options: pollData.options.map(opt => ({
          text: opt,
          votes: 0
        } as PollOption)),
        createdBy: user.id,
        settings: {
          allowMultipleVotes: false,
          requireAuthentication: true
        }
      };

      const { data, error } = await supabase
        .from("polls")
        .insert([poll])
        .select()
        .single();
        
      if (error) throw new AppError(error.message);
      return data;
    } catch (error) {
      throw handleError(error);
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
      throw handleError(error);
    }
  }

  static async submitVote(pollId: string, optionIndex: number, userId?: string) {
    try {
      const supabase = await createClient();
      
      // Check if poll exists and is not ended
      const poll = await this.getById(pollId);
      if (!poll) throw new AppError("Poll not found");
      if (poll.endDate && new Date() > new Date(poll.endDate)) {
        throw new AppError("Voting for this poll has ended.");
      }
      // Validate optionIndex
      if (!Number.isFinite(optionIndex) || optionIndex < 0 || optionIndex >= (poll.options?.length ?? 0)) {
        throw new AppError("Invalid option selected.", 400);
      }

      // Attempt to insert the vote. Rely on DB unique constraint to prevent duplicates.
      try {
        const { error } = await supabase.from("votes").insert([{
          pollId,
          userId: userId ?? null,
          optionId: poll.options[optionIndex].id
        }]);

        if (error) {
          // Detect unique constraint violation from Postgres/Supabase
          const code = (error as any)?.code ?? (error as any)?.statusCode ?? (error as any)?.status;
          const msg = (error && typeof error === 'object' && 'message' in error) ? (error as any).message : JSON.stringify(error);
          // Common Postgres unique violation SQLSTATE is '23505' and Supabase error may include that
          if ((error as any)?.code === '23505' || (error as any)?.message?.includes('duplicate key') || (error as any)?.hint?.includes('unique')) {
            throw new AppError("You have already voted in this poll.", 409);
          }
          throw new AppError(`Vote insert failed: ${msg}`);
        }
      } catch (dbErr) {
        // If dbErr is already an AppError, rethrow; else wrap
        if (dbErr instanceof AppError) throw dbErr;
        const normalized = handleError(dbErr);
        const message = normalized && (normalized as any).error ? (normalized as any).error : JSON.stringify(normalized);
        throw new AppError(message, (normalized as any)?.statusCode || 500);
      }

      return true;
    } catch (error) {
      throw handleError(error);
    }
  }

  static async delete(id: string) {
    try {
      const supabase = await createClient();
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new AppError(userError.message);
      if (!user) throw new AppError("Not authenticated", 401);
      
      // Fetch poll to check ownership
      const poll = await this.getById(id);
      if (!poll) throw new AppError("Poll not found");
      
      // Only allow owner or admin to delete
      if (poll.createdBy !== user.id && user.user_metadata?.role !== "admin") {
        throw new AppError("Unauthorized: Only the poll owner or an admin can delete this poll.", 403);
      }

      const { error } = await supabase
        .from("polls")
        .delete()
        .eq("id", id);
        
      if (error) throw new AppError(error.message);
      return true;
    } catch (error) {
      throw handleError(error);
    }
  }
}
