// import { AppError } from "./AppError"; 

import { AppError } from "./AppError.js";


export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401);
  }
}