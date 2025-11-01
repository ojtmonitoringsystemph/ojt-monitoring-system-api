import { FilterQuery } from "mongoose";
import { AppError } from "../middleware/errorHandler";
import { UserModel } from "../models/userModel";
import { UserRepository } from "../repositories/userRepository";

// *Purpose: This service class is responsible for handling the business logic of the user entity. It interacts with the user repository to perform CRUD operations on the user entity.
export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUser(id: string): Promise<UserModel | null> {
    const user = await this.userRepository.getUser(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  async getUsers(): Promise<UserModel[]> {
    return this.userRepository.getUsers();
  }

  async createUser(userData: Partial<UserModel>) {
    if (!userData.firstName || !userData.lastName) {
      throw new AppError("User firstname and lastname data are required", 400);
    }

    if (!userData.email) {
      throw new AppError("Email is required", 400);
    }

    if (!userData.role) {
      throw new AppError("Invalid role. Must be admin, coordinator, or student", 400);
    }

    const existingUserByEmail = await this.userRepository.searchAndUpdate({
      email: userData.email,
    });

    if (existingUserByEmail) {
      throw new AppError("User with this email are alrady exists", 400);
    }

    return await this.userRepository.createUser(userData);
  }

  async updateUser(updateData: Partial<UserModel>): Promise<UserModel | null> {
    if (!updateData._id) {
      throw new AppError("User ID is required", 400);
    }

    const user = await this.userRepository.updateUser(updateData._id, updateData);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  async deleteUser(id: string): Promise<UserModel | null> {
    const user = await this.userRepository.deleteUser(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  async searchUser(query: FilterQuery<UserModel>, options?: { multiple?: boolean }): Promise<UserModel | UserModel[]> {
    const caseInsensitiveQuery = Object.keys(query).reduce((acc, key) => {
      const value = query[key];
      if (typeof value === "string") {
        acc[key] = { $regex: new RegExp(value, "i") };
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as FilterQuery<UserModel>);

    const { multiple = false } = options || {};

    if (multiple) {
      const users = await this.userRepository.searchUser(caseInsensitiveQuery, { multiple: true, populate: true });
      if (!users || (Array.isArray(users) && users.length === 0)) {
        throw new AppError("No users found", 404);
      }
      return users as UserModel[];
    } else {
      const user = await this.userRepository.searchUser(caseInsensitiveQuery);
      if (!user || Array.isArray(user)) {
        throw new AppError("User not found", 404);
      }
      return user;
    }
  }

  async assignUserToCompany(
    userId: string,
    companyId: string,
    coordinatorId: string,
    deploymentDate?: Date,
    status?: "scheduled" | "deployed" | "completed"
  ): Promise<UserModel | null> {
    // Check if user exists
    const user = await this.userRepository.getUser(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if user is a student
    if (user.role !== "student") {
      throw new AppError("Only students can be assigned to companies", 400);
    }

    // Check if user is already assigned to a company
    if (user.metadata?.company) {
      throw new AppError("User is already assigned to a company", 400);
    }

    // Update user with company assignment
    const updateData: Partial<UserModel> = {
      metadata: {
        ...user.metadata,
        company: companyId as any,
        coordinator: coordinatorId as any,
        deploymentDate: deploymentDate || new Date(),
        status: status || "scheduled",
      },
    };

    const updatedUser = await this.userRepository.updateUser(userId, updateData);
    if (!updatedUser) {
      throw new AppError("Failed to assign user to company", 500);
    }

    return updatedUser;
  }

  async unassignUserFromCompany(userId: string): Promise<UserModel | null> {
    // Check if user exists
    const user = await this.userRepository.getUser(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if user is a student
    if (user.role !== "student") {
      throw new AppError("Only students can be unassigned from companies", 400);
    }

    // Check if user is assigned to a company
    if (!user.metadata?.company) {
      throw new AppError("User is not assigned to any company", 400);
    }

    // Update user to remove company assignment
    const updateData: Partial<UserModel> = {
      metadata: {
        ...user.metadata,
        company: undefined,
        deploymentDate: undefined,
        status: "scheduled",
      },
    };

    const updatedUser = await this.userRepository.updateUser(userId, updateData);
    if (!updatedUser) {
      throw new AppError("Failed to unassign user from company", 500);
    }

    return updatedUser;
  }

  async updateUserDeploymentStatus(
    userId: string,
    status: "scheduled" | "deployed" | "completed"
  ): Promise<UserModel | null> {
    // Check if user exists
    const user = await this.userRepository.getUser(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if user is a student
    if (user.role !== "student") {
      throw new AppError("Only student deployment status can be updated", 400);
    }

    // Check if user is assigned to a company
    if (!user.metadata?.company) {
      throw new AppError("User is not assigned to any company", 400);
    }

    // Update user deployment status
    const updateData: Partial<UserModel> = {
      metadata: {
        ...user.metadata,
        status: status,
      },
    };

    const updatedUser = await this.userRepository.updateUser(userId, updateData);
    if (!updatedUser) {
      throw new AppError("Failed to update user deployment status", 500);
    }

    return updatedUser;
  }

  async getUserDashboard(userId: string, userRole: string): Promise<any> {
    const dashboardData = await this.userRepository.userDashboard(userId, userRole);

    if (!dashboardData || dashboardData.length === 0) {
      throw new AppError("Dashboard data not found", 404);
    }

    return dashboardData[0];
  }
}
