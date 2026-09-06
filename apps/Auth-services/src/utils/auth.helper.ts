
import crypto from "crypto";
// import { ValidationError } from "../../../../packages/error-handler"; 
import { ValidationError } from "@org/error-handler";
// import redis from "../../../../packages/libs/redis"; 
import redis from "@org/redis";
import { sendEmail } from "./sendMail";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// =======================================
// Validate Registration Data
// =======================================

export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError("Missing required fields for registration");
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }

if (password.length < 8) {
  throw new ValidationError(
    "Password must be at least 8 characters long"
  );
}
};

// =======================================
// OTP Restrictions
// =======================================

export const checkOtpRestrictions = async (email: string) => {
  if (await redis.get(`otp_lock:${email}`)) {
    throw new ValidationError(
      "Account is locked due to multiple failed attempts! Try again after 20 minutes."
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    throw new ValidationError(
      "Too many OTP requests! Try again after 1 hour."
    );
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    throw new ValidationError(
      "Please wait 1 minute before requesting a new OTP."
    );
  }
};

// =======================================
// Track OTP Requests
// =======================================

export const trackOtpRequests = async (email: string) => {
  const otpRequestKey = `otp_requests:${email}`;

  const otpRequests = Number(
    (await redis.get(otpRequestKey)) || "0"
  );

  if (otpRequests >= 2) {
    await redis.set(
      `otp_spam_lock:${email}`,
      "locked",
      "EX",
      3600
    );

    throw new ValidationError(
      "Too many OTP requests! Try again after 1 hour."
    );
  }

  await redis.set(
    otpRequestKey,
    (otpRequests + 1).toString(),
    "EX",
    3600
  );
};

// =======================================
// Send OTP
// =======================================

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();

  console.log("================================");
  console.log("Generated OTP:", otp);
  console.log("Email:", email);
  console.log("================================");

  await sendEmail(email, "Verify your email", template, {
    name,
    otp,
  });

  // OTP expires in 5 minutes
  await redis.set(`otp:${email}`, otp, "EX", 300);

  // User must wait 1 minute before requesting another OTP
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
};

// =======================================
// Verify OTP
// =======================================

export const verifyOtp = async (
  email: string,
  otp: string
) => {
  const storedOtp = await redis.get(`otp:${email}`);

  if (!storedOtp) {
    throw new ValidationError(
      "OTP has expired. Please request a new one."
    );
  }

  const failedAttemptsKey = `otp_failed_attempts:${email}`;

  const failedAttempts = Number(
    (await redis.get(failedAttemptsKey)) || "0"
  );

  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(
        `otp_lock:${email}`,
        "locked",
        "EX",
        1200
      );

      await redis.del(`otp:${email}`);
      await redis.del(failedAttemptsKey);

      throw new ValidationError(
        "Account is locked due to multiple failed attempts! Try again after 20 minutes."
      );
    }

    await redis.set(
      failedAttemptsKey,
      (failedAttempts + 1).toString(),
      "EX",
      1200
    );

    throw new ValidationError(
      `Invalid OTP. Please try again. ${2 - failedAttempts} attempts left.`
    );
  }

  // OTP Verified Successfully

  await redis.del(`otp:${email}`);
  await redis.del(failedAttemptsKey);
};