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

  @route.post("/")
  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.createUser(req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  @route.get("/:id")
  getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.getUser(req.params.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

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

  @route.post("/upload/:id") // user id
  @UseMiddleware(upload.single("image"))
  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      if (!req.file) {
        throw new AppError("Please upload an image", 400);
      }

      const imageUrl = await this.cloudinaryService.uploadImage(req.file, "user-avatars");
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
