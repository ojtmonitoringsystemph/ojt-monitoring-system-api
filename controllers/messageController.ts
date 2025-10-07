import { NextFunction, Request, Response } from "express";
import { route } from "express-extract-routes";
import { requireAuthentication } from "../helpers/auth";
import { MessageService } from "../services/messageService";
import { TokenPayload } from "../helpers/interface";
import { Server as SocketIOServer } from "socket.io";

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

@route("/message")
export class MessageController {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  private getSocketIO(req: Request): SocketIOServer | undefined {
    return req.app.get("io");
  }

  @route.post("/")
  createMessage = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      const io = this.getSocketIO(req);

      const messageData = {
        sender: req.user!.id as any,
        receiver: req.body.receiver,
        content: req.body.content,
        isRead: req.body.isRead,
        sentAt: req.body.sentAt,
      };

      const message = await this.messageService.createMessage(messageData, io);
      res.json(message);
    } catch (error) {
      next(error);
    }
  };

  @route.get("/:id")
  getMessage = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      const io = this.getSocketIO(req);
      const message = await this.messageService.getMessage(req.params.id, req.user!.id, io);
      res.json(message);
    } catch (error) {
      next(error);
    }
  };

  @route.get("/")
  getMessages = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      const io = this.getSocketIO(req);
      const messages = await this.messageService.getMessages(req.user!.id, io);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  };

  @route.patch("/")
  updateMessage = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      const io = this.getSocketIO(req);
      const message = await this.messageService.updateMessage(req.body, io);
      res.json(message);
    } catch (error) {
      next(error);
    }
  };

  @route.delete("/:id")
  deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      await this.messageService.deleteMessage(req.params.id);
      res.send("Message deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  @route.post("/search")
  searchMessage = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      const io = this.getSocketIO(req);
      const message = await this.messageService.searchMessage(req.body, req.user!.id, io);
      res.json(message);
    } catch (error) {
      next(error);
    }
  };

  @route.patch("/:id/read")
  markAsRead = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      const io = this.getSocketIO(req);
      const message = await this.messageService.markAsRead(req.params.id, req.user!.id, io);
      res.json(message);
    } catch (error) {
      next(error);
    }
  };
}
