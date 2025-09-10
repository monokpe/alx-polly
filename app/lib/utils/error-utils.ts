export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const handleError = (error: unknown): never => {
  // If it's already an AppError, return it as is
  if (error instanceof AppError) {
    throw error;
  }

  // If it's a native Error, wrap it in AppError preserving message and code if available
  if (error instanceof Error) {
    const statusCode =
      (error as any)?.statusCode ?? (error as any)?.code ?? 500;
    throw new AppError(error.message, statusCode);
  }

  // For unknown values, create a generic error message
  throw new AppError("An unexpected error occurred", 500);
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>"'`]/g, "").trim();
};
