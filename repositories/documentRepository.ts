import { Documents, DocumentsModel } from "../models/documentModel";
import { FilterQuery, UpdateQuery } from "mongoose";

// Purpose: This file is responsible for handling all the database operations related to the document model.
export class DocumentsRepository {
  // Get a single document by id with student populated
  async getDocument(id: string): Promise<DocumentsModel | null> {
    return Documents.findById(id).populate("student", "firstName lastName email program");
  }

  // Get all documents with student populated
  async getDocuments(): Promise<DocumentsModel[]> {
    return Documents.find().populate("student", "firstName lastName email program");
  }

  // Get all documents for a specific student
  async getDocumentsByStudentId(studentId: string): Promise<DocumentsModel[]> {
    return Documents.find({ student: studentId }).populate(
      "student",
      "firstName lastName email program"
    );
  }

  // Create a new document (no need to populate on create)
  async createDocument(data: Partial<DocumentsModel>): Promise<DocumentsModel> {
    return Documents.create(data);
  }

  // Update a document and return populated student
  async updateDocument(id: string, data: Partial<DocumentsModel>): Promise<DocumentsModel | null> {
    return Documents.findByIdAndUpdate(id, data, { new: true }).populate("student");
  }

  // Delete a document (no populate needed)
  async deleteDocument(id: string): Promise<DocumentsModel | null> {
    return Documents.findByIdAndDelete(id);
  }

  // Search one document and populate student
  async searchDocument(query: FilterQuery<DocumentsModel>): Promise<DocumentsModel | null> {
    return Documents.findOne(query).populate("student");
  }

  // Add files to a document and return populated student
  async addFilesToDocument(id: string, documents: string[]): Promise<DocumentsModel | null> {
    return Documents.findByIdAndUpdate(
      id,
      { $addToSet: { documents: { $each: documents } } },
      { new: true }
    ).populate("student");
  }

  // Remove files from a document and return populated student
  async removeFilesFromDocument(id: string, documents: string[]): Promise<DocumentsModel | null> {
    return Documents.findByIdAndUpdate(
      id,
      { $pullAll: { documents: documents } },
      { new: true }
    ).populate("student");
  }

  // Search and update with optional multi-update
  async searchAndUpdate(
    query: FilterQuery<DocumentsModel>,
    update?: UpdateQuery<DocumentsModel>,
    options?: { multi?: boolean }
  ): Promise<DocumentsModel | null | { modifiedCount: number }> {
    if (!update) {
      return Documents.findOne(query).populate("student");
    }

    if (options?.multi) {
      const result = await Documents.updateMany(query, update);
      return { modifiedCount: result.modifiedCount };
    }

    return Documents.findOneAndUpdate(query, update, { new: true }).populate("student");
  }
}
