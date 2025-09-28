import { UserModel } from "@/models/userModel";

export interface LoginCredentials {
  email: string;
  password: string;
  role: "admin" | "coordinator" | "student";
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  middleName: string;
  program: "bsit" | "bsba";
  role: "admin" | "coordinator" | "student";
  email: string;
  password: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  firstName: string;
  role?: "admin" | "coordinator" | "student";
}

export interface AuthResponse {
  user: Omit<UserModel, "password">;
  accessToken: string;
  refreshToken: string;
}
