import { UserModel } from "@/models/userModel";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  middleName: string;
  role: "admin" | "coordinator" | "student";
  email: string;
  password: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  firstName: string;
}

export interface AuthResponse {
  user: Omit<UserModel, "password">;
  accessToken: string;
  refreshToken: string;
}
