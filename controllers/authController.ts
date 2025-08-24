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

  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - email
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 description: The user's username
   *               email:
   *                 type: string
   *                 format: email
   *                 description: The user's email address
   *               password:
   *                 type: string
   *                 minLength: 6
   *                 description: The user's password
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   type: object
   *                   description: User data without password
   *                 accessToken:
   *                   type: string
   *                   description: JWT access token
   *                 refreshToken:
   *                   type: string
   *                   description: JWT refresh token
   *       400:
   *         description: Validation error or user already exists
   */
  @route.post("/register")
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, email, password } = req.body as RegisterData;

      const result = await this.authService.register({ username, email, password });
      res.status(201).json({
        status: "success",
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Login user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: The user's email address
   *               password:
   *                 type: string
   *                 description: The user's password
   *     responses:
   *       200:
   *         description: User logged in successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   type: object
   *                   description: User data without password
   *                 accessToken:
   *                   type: string
   *                   description: JWT access token
   *                 refreshToken:
   *                   type: string
   *                   description: JWT refresh token
   *       401:
   *         description: Invalid credentials
   */
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

  /**
   * @swagger
   * /auth/refresh:
   *   post:
   *     summary: Refresh access token
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 description: The refresh token
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accessToken:
   *                   type: string
   *                   description: New JWT access token
   *                 refreshToken:
   *                   type: string
   *                   description: New JWT refresh token
   *       401:
   *         description: Invalid or expired refresh token
   */
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

  /**
   * @swagger
   * /auth/profile:
   *   get:
   *     summary: Get user profile
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   type: object
   *                   description: User data without password
   *       401:
   *         description: Unauthorized or invalid token
   */
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

  /**
   * @swagger
   * /auth/change-password:
   *   patch:
   *     summary: Change user password
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - currentPassword
   *               - newPassword
   *             properties:
   *               currentPassword:
   *                 type: string
   *                 description: The user's current password
   *               newPassword:
   *                 type: string
   *                 minLength: 6
   *                 description: The user's new password
   *     responses:
   *       200:
   *         description: Password changed successfully
   *       400:
   *         description: Validation error or incorrect current password
   *       401:
   *         description: Unauthorized or invalid token
   */
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

  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     summary: Logout user (client-side token removal)
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User logged out successfully
   */
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
