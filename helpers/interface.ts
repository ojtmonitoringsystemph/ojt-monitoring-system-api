import { UserModel } from "@/models/userModel";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  user: Omit<UserModel, "password">;
  accessToken: string;
  refreshToken: string;
}
