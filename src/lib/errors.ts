export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: "VALIDATION" | "NOT_FOUND" | "FORBIDDEN" | "UNAUTHORIZED"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toActionError(error: unknown): { error: string } {
  if (error instanceof AppError) {
    return { error: error.message };
  }
  if (error instanceof Error && error.message.includes("Unique constraint")) {
    return { error: "This document is already shared with that user." };
  }
  console.error(error);
  return { error: "Something went wrong. Please try again." };
}
