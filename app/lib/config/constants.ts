export const AUTH = {
  RATE_LIMIT: {
    WINDOW: 60 * 1000, // 1 minute
    MAX_ATTEMPTS: 5,
  },
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_REGEX:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
  },
};

export const POLLS = {
  VALIDATION: {
    QUESTION_MIN_LENGTH: 5,
    QUESTION_MAX_LENGTH: 200,
    OPTION_MIN_LENGTH: 1,
    OPTION_MAX_LENGTH: 100,
    MIN_OPTIONS: 2,
  },
  SANITIZATION: {
    UNSAFE_CHARS_REGEX: /[<>"'`]/g,
  },
};
