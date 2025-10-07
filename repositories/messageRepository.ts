import { Message, MessageModel } from "../models/messageModel";
import { FilterQuery, UpdateQuery } from "mongoose";

// Purpose: This file is responsible for handling all the database operations related to the message model.
export class MessageRepository {
  // This method returns a message in the database that matches the id.
  async getMessage(id: string): Promise<MessageModel | null> {
    return Message.findById(id);
  }

  // This method returns all the message in the database.
  async getMessages(): Promise<MessageModel[]> {
    return Message.find();
  }

  // This method creates a bew message in the database.
  async createMessage(data: Partial<MessageModel>): Promise<MessageModel> {
    return Message.create(data);
  }

  // This method updates a message in the database.
  async updateMessage(id: string, data: Partial<MessageModel>): Promise<MessageModel | null> {
    return Message.findByIdAndUpdate(id, data, { new: true });
  }

  // This method deletes a message from the database.
  async deleteMessage(id: string): Promise<MessageModel | null> {
    return Message.findByIdAndDelete(id);
  }

  // This method searches for a message in the database that matches the query object.
  async searchMessage(query: FilterQuery<MessageModel>): Promise<MessageModel | null> {
    return Message.findOne(query);
  }

  async searchAndUpdate(
    query: FilterQuery<MessageModel>,
    update?: UpdateQuery<MessageModel>,
    options?: { multi?: boolean }
  ): Promise<MessageModel | null | { modifiedCount: number }> {
    if (!update) {
      return Message.findOne(query);
    }

    if (options?.multi) {
      const result = await Message.updateMany(query, update);
      return { modifiedCount: result.modifiedCount };
    }

    return Message.findOneAndUpdate(query, update, { new: true });
  }
}
