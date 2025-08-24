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

  async searchUser(query: FilterQuery<UserModel>): Promise<UserModel | null> {
    const caseInsensitiveQuery = Object.keys(query).reduce((acc, key) => {
      const value = query[key];
      if (typeof value === "string") {
        acc[key] = { $regex: new RegExp(value, "i") };
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as FilterQuery<UserModel>);

    const user = await this.userRepository.searchUser(caseInsensitiveQuery);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }
}
