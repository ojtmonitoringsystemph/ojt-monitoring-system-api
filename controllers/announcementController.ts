import { NextFunction, Request, Response } from "express";
import { route } from "express-extract-routes";
import { requireAuthentication } from "../helpers/auth";
import { AnnouncementService } from "../services/announcementService";
import { TokenPayload } from "../helpers/interface";

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

@route("/announcement")
export class AnnouncementController {
  private announcementService: AnnouncementService;

  constructor() {
    this.announcementService = new AnnouncementService();
  }

  @route.post("/")
  createAnnouncement = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      const announcementData = {
        title: req.body.title,
        content: req.body.content,
        createdBy: req.user!.id as any,
      };

      const announcement = await this.announcementService.createAnnouncement(announcementData);
      res.json(announcement);
    } catch (error) {
      next(error);
    }
  };

  @route.get("/:id")
  getAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const announcement = await this.announcementService.getAnnouncement(req.params.id);
      res.json(announcement);
    } catch (error) {
      next(error);
    }
  };

  @route.get("/")
  getAnnouncements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      const users = await this.announcementService.getAnnouncements();
      res.json(users);
    } catch (error) {
      next(error);
    }
  };

  @route.patch("/")
  updateAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      const announcement = await this.announcementService.updateAnnouncement(req.body);
      res.json(announcement);
    } catch (error) {
      next(error);
    }
  };

  @route.delete("/:id")
  deleteAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      await this.announcementService.deleteAnnouncement(req.params.id);
      res.send("User deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  @route.post("/search")
  searchAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      const announcement = await this.announcementService.searchAnnouncement(req.body);
      res.json(announcement);
    } catch (error) {
      next(error);
    }
  };
}
