import { FilterQuery } from "mongoose";
import { AppError } from "../middleware/errorHandler";
import { MessageModel } from "../models/messageModel";
import { MessageRepository } from "../repositories/messageRepository";
import { EmailService } from "./emailService";
import { Server as SocketIOServer } from "socket.io";

export class MessageService {
  private messageRepository: MessageRepository;
  private emailService: EmailService;

  constructor() {
    this.messageRepository = new MessageRepository();
    this.emailService = new EmailService();
  }

  async getMessage(id: string, userId?: string, io?: SocketIOServer): Promise<MessageModel | null> {
    const message = await this.messageRepository.getMessage(id);
    if (!message) {
      throw new AppError("Message not found", 404);
    }

    // Emit message viewed event
    if (io && userId) {
      io.to(userId).emit("messageViewed", {
        messageId: message._id,
        viewedAt: new Date(),
      });

      // If the viewing user is the receiver, emit to sender that message was seen
      if (String(message.receiver) === userId && message.sender) {
        io.to(String(message.sender)).emit("messageSeen", {
          messageId: message._id,
          seenBy: userId,
          seenAt: new Date(),
        });
      }
    }

    return message;
  }

  async getMessages(userId?: string, io?: SocketIOServer): Promise<MessageModel[]> {
    const messages = await this.messageRepository.getMessages();

    // Emit messages fetched event
    if (io && userId) {
      io.to(userId).emit("messagesFetched", {
        userId: userId,
        messagesCount: messages.length,
        fetchedAt: new Date(),
      });
    }

    return messages;
  }

  async createMessage(data: Partial<MessageModel>, io?: SocketIOServer) {
    if (!data) {
      throw new AppError("Message data are required", 400);
    }

    const message = await this.messageRepository.createMessage(data);

    // Emit the message to both sender and receiver rooms for real-time updates
    if (io && message) {
      const populatedMessage = await this.messageRepository.getMessage(message._id);

      // Emit to receiver
      if (message.receiver) {
        io.to(String(message.receiver)).emit("newMessage", populatedMessage);
      }

      // Emit to sender for confirmation
      if (message.sender) {
        io.to(String(message.sender)).emit("messageSent", populatedMessage);
      }

      // Send email notification to recipient
      try {
        await this.emailService.sendMessageNotificationToRecipient(message);
      } catch (error) {
        console.error("Failed to send message email notification:", error);
        // Don't throw error to avoid breaking the message creation
      }
    }

    return message;
  }

  async updateMessage(
    updateData: Partial<MessageModel>,
    io?: SocketIOServer
  ): Promise<MessageModel | null> {
    if (!updateData._id) {
      throw new AppError("Message ID is required", 400);
    }

    // Check if message exists first
    const existing = await this.messageRepository.getMessage(updateData._id);
    if (!existing) {
      throw new AppError("Message not found", 404);
    }

    const message = await this.messageRepository.updateMessage(updateData._id, updateData);

    // If message was marked as read, emit update to sender
    if (io && message && updateData.isRead && message.sender) {
      io.to(String(message.sender)).emit("messageRead", {
        messageId: message._id,
        isRead: message.isRead,
      });
    }

    return message;
  }

  async markAsRead(
    messageId: string,
    userId: string,
    io?: SocketIOServer
  ): Promise<MessageModel | null> {
    const message = await this.messageRepository.getMessage(messageId);
    if (!message) {
      throw new AppError("Message not found", 404);
    }

    // Only receiver can mark message as read
    if (String(message.receiver) !== userId) {
      throw new AppError("Unauthorized to mark this message as read", 403);
    }

    const updatedMessage = await this.messageRepository.updateMessage(messageId, { isRead: true });

    // Emit read receipt to sender
    if (io && updatedMessage && message.sender) {
      io.to(String(message.sender)).emit("messageRead", {
        messageId: updatedMessage._id,
        isRead: true,
      });
    }

    return updatedMessage;
  }

  async deleteMessage(id: string): Promise<MessageModel | null> {
    const message = await this.messageRepository.deleteMessage(id);
    if (!message) {
      throw new AppError("Message not found", 404);
    }
    return message;
  }

  async searchMessage(
    query: FilterQuery<MessageModel>,
    userId?: string,
    io?: SocketIOServer
  ): Promise<MessageModel | null> {
    const caseInsensitiveQuery = Object.keys(query).reduce((acc, key) => {
      const value = query[key];
      if (typeof value === "string") {
        acc[key] = { $regex: new RegExp(value, "i") };
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as FilterQuery<MessageModel>);

    const message = await this.messageRepository.searchMessage(caseInsensitiveQuery);
    if (!message) {
      throw new AppError("Message not found", 404);
    }

    // Emit search performed event
    if (io && userId) {
      io.to(userId).emit("messageSearched", {
        userId: userId,
        searchQuery: query,
        resultFound: !!message,
        searchedAt: new Date(),
      });
    }

    return message;
  }
}
