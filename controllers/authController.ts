import { NextFunction, Request, Response } from "express";
import { route } from "express-extract-routes";
import { LoginCredentials, RegisterData } from "../helpers/interface";
import { AppError } from "../middleware/errorHandler";
import { AuthService } from "../services/authService";

// Purpose: This controller class is responsible for handling authentication-related requests including registration, login, token refresh, and profile management.
@route("/auth")
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  @route.post("/register")
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { firstName, lastName, middleName, role, email, password } = req.body as RegisterData;

      // Validate user student by default cannot create a user role is admin and coordinator
      if (role === "admin" || role === "coordinator") {
        throw new AppError("Students cannot create admin or coordinator accounts", 403);
      }

      const result = await this.authService.register({
        firstName,
        lastName,
        middleName,
        role,
        email,
        password,
      });

      res.status(201).json({
        status: "success",
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  @route.post("/login")
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as LoginCredentials;

      const result = await this.authService.login({ email, password });
      res.json({
        status: "success",
        message: "User logged in successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  @route.post("/refresh")
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError("Refresh token is required", 400);
      }

      const result = await this.authService.refreshToken(refreshToken);
      res.json({
        status: "success",
        message: "Token refreshed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  @route.get("/profile")
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // User ID will be set by authentication middleware
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new AppError("Authentication required", 401);
      }

      const user = await this.authService.getProfile(userId);
      res.json({
        status: "success",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  @route.patch("/change-password")
  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        throw new AppError("Authentication required", 401);
      }

      if (!currentPassword || !newPassword) {
        throw new AppError("Current password and new password are required", 400);
      }

      if (newPassword.length < 6) {
        throw new AppError("New password must be at least 6 characters long", 400);
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);
      res.json({
        status: "success",
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  @route.post("/logout")
  logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // For JWT, logout is typically handled client-side by removing the token
      // In a more advanced implementation, you might maintain a blacklist of tokens
      res.json({
        status: "success",
        message: "User logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
