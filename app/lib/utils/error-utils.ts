export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof AppError) {
    return { error: error.message, code: error.code, statusCode: error.statusCode };
  }
  
  if (error instanceof Error) {
    return { error: error.message, statusCode: 500 };
  }
  
  return { error: 'An unexpected error occurred', statusCode: 500 };
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>"'`]/g, '').trim();
};
