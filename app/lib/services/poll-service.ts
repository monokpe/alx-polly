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

      // Check for previous votes if user is authenticated
      if (userId) {
        const { data: existingVote, error: voteError } = await supabase
          .from("votes")
          .select("id")
          .eq("pollId", pollId)
          .eq("userId", userId)
          .single();
          
        if (!voteError && existingVote) {
          throw new AppError("You have already voted in this poll.");
        }
      }

      // Submit vote
      const { error } = await supabase.from("votes").insert([{
        pollId,
        userId,
        optionId: poll.options[optionIndex].id
      }]);

      if (error) throw new AppError(error.message);
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
