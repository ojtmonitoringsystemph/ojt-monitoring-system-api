import { NextFunction, Request, Response } from "express";
import { route } from "express-extract-routes";
import { requireAuthentication } from "../helpers/auth";
import { AppError } from "../middleware/errorHandler";
import { upload } from "../middleware/multer";
import { UseMiddleware } from "../middleware/useMiddleware";
import { CloudinaryService } from "../services/cloudinaryService";
import { DocumentsService } from "../services/documentService";

@route("/document")
export class DocumentsController {
  private documentService: DocumentsService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.documentService = new DocumentsService();
    this.cloudinaryService = new CloudinaryService();
  }

  @route.post("/")
  @UseMiddleware(upload.array("files", 10))
  async createAndUploadFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new AppError("Please upload at least one file", 400);
      }

      // Upload all files to Cloudinary
      const fileUrls: string[] = [];
      for (const file of req.files) {
        const fileUrl = await this.cloudinaryService.uploadFile(file, "documents");
        fileUrls.push(fileUrl);
      }

      // Create new document with uploaded files
      const documentData = {
        student: req.body.student,
        program: req.body.program,
        fileType: req.body.fileType,
        fileUrl: fileUrls,
        status: "pending" as const,
        remarks: req.body.remarks || "",
      };

      const document = await this.documentService.createDocument(documentData);
      res.json(document);
    } catch (error) {
      next(error);
    }
  }

  @route.get("/:id")
  getDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const document = await this.documentService.getDocument(req.params.id);
      res.json(document);
    } catch (error) {
      next(error);
    }
  };

  @route.get("/")
  getDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      const document = await this.documentService.getDocuments();
      res.json(document);
    } catch (error) {
      next(error);
    }
  };

  @route.get("/student/:studentId")
  getDocumentsByStudentId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      const documents = await this.documentService.getDocumentsByStudentId(req.params.studentId);
      res.json(documents);
    } catch (error) {
      next(error);
    }
  };

  @route.patch("/")
  updateDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      const document = await this.documentService.updateDocument(req.body);
      res.json(document);
    } catch (error) {
      next(error);
    }
  };

  @route.delete("/:id")
  deleteDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      await this.documentService.deleteDocument(req.params.id);
      res.send("Data deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  @route.post("/search")
  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      const document = await this.documentService.searchDocument(req.body);
      res.json(document);
    } catch (error) {
      next(error);
    }
  };

  @route.post("/add-files/:id")
  @UseMiddleware(upload.array("files", 10))
  async addFilesToDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new AppError("Please upload at least one file", 400);
      }

      // Upload all files to Cloudinary
      const fileUrls: string[] = [];
      for (const file of req.files) {
        const fileUrl = await this.cloudinaryService.uploadFile(file, "documents");
        fileUrls.push(fileUrl);
      }

      const document = await this.documentService.addFilesToDocument(req.params.id, fileUrls);
      res.json(document);
    } catch (error) {
      next(error);
    }
  }

  @route.post("/remove-files/:id")
  async removeFilesFromDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Require authentication for this endpoint
      await requireAuthentication(req, res);

      const { fileUrls } = req.body;
      if (!fileUrls || !Array.isArray(fileUrls) || fileUrls.length === 0) {
        throw new AppError("File URLs array is required", 400);
      }

      const document = await this.documentService.removeFilesFromDocument(req.params.id, fileUrls);
      res.json(document);
    } catch (error) {
      next(error);
    }
  }
}
