import { NextFunction, Request, Response } from "express";
import { route } from "express-extract-routes";
import { requireAuthentication } from "../helpers/auth";
import { AppError } from "../middleware/errorHandler";
import { upload } from "../middleware/multer";
import { UseMiddleware } from "../middleware/useMiddleware";
import { CloudinaryService } from "../services/cloudinaryService";
import { UserService } from "../services/userService";

// Purpose: This controller class is responsible for handling the user related requests.
@route("/user")
export class UserController {
  private userService: UserService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.userService = new UserService();
    this.cloudinaryService = new CloudinaryService();
  }

  /**
   * @swagger
   * /user:
   *   post:
   *     summary: Create a user
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              username:
   *                type: string
   *              email:
   *                type: string
   *              password:
   *                type: string
   *     responses:
   *       200:
   *         description: User updated successfully
   *       404:
   *         description: User not found
   *       401:
   *         description: Unauthorized
   */
  @route.post("/")
  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.createUser(req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /user/{id}:
   *   get:
   *     summary: Get a user by ID
   *     tags: [User]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The user ID
   *     responses:
   *       200:
   *         description: The user data
   *       404:
   *         description: User not found
   */
  @route.get("/:id")
  getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.getUser(req.params.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /user:
   *   get:
   *     summary: Get the users
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: The user data
   *       404:
   *         description: User not found
   *       401:
   *         description: Unauthorized
   */
  @route.get("/")
  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      const role = req.query.role as string | undefined;
      const users = await this.userService.getUsers(role);
      res.json(users);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /user:
   *   put:
   *     summary: Update a user
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              username:
   *                type: string
   *              email:
   *                type: string
   *              password:
   *                type: string
   *     responses:
   *       200:
   *         description: User updated successfully
   *       404:
   *         description: User not found
   *       401:
   *         description: Unauthorized
   */
  @route.patch("/")
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      const user = await this.userService.updateUser(req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /user/{id}:
   *   delete:
   *     summary: Delete a user by ID
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The delete user
   *     responses:
   *       200:
   *         description: User deleted successfully
   *       404:
   *         description: User not found
   *       401:
   *         description: Unauthorized
   */
  @route.delete("/:id")
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      await this.userService.deleteUser(req.params.id);
      res.send("User deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /user/search:
   *   post:
   *     summary: Search for a user
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 description: The search query
   *     responses:
   *       200:
   *         description: The user data
   *       404:
   *         description: User not found
   *       401:
   *         description: Unauthorized
   */
  @route.post("/search")
  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      const user = await this.userService.searchUser(req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /user/upload/{id}:
   *   post:
   *     summary: Upload user profile image
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               image:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Image uploaded successfully
   *       400:
   *         description: No image provided
   *       401:
   *         description: Unauthorized
   */
  @route.post("/upload/:id")
  @UseMiddleware(upload.single("image"))
  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      if (!req.file) {
        throw new AppError("Please upload an image", 400);
      }

      const imageUrl = await this.cloudinaryService.uploadImage(req.file);
      const updateData = {
        _id: req.params.id,
        avatar: imageUrl,
      };

      const user = await this.userService.updateUser(updateData);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}
