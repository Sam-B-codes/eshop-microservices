export class AppError extends Error {
  public readonly statusCode: number;
  public readonly success: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    details?: unknown
  ) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}