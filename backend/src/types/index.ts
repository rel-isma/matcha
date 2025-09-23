export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
