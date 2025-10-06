import { extract } from "express-extract-routes";
//used relative path to get the controller during runtime
import { UserController } from "../controllers/userController";
import { ServerController } from "../controllers/serverController";
import { AuthController } from "../controllers/authController";
import { DocumentsController } from "../controllers/documentController";
import { TaskController } from "../controllers/taskController";
import { CompanyController } from "../controllers/companyController";
import { AnnouncementController } from "../controllers/announcementController";

// Extract all routes from the controllers.
export const routes = extract(
  UserController,
  ServerController,
  AuthController,
  DocumentsController,
  TaskController,
  CompanyController,
  AnnouncementController
);
