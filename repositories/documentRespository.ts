import { Documents, DocumentsModel } from "../models/documentModel";
import { FilterQuery, UpdateQuery } from "mongoose";

// Purpose: This file is responsible for handling all the database operations related to the document model.
export class DocumentsRepository {
  // This method returns a document in the database that matches the id.
  async getDocument(id: string): Promise<DocumentsModel | null> {
    return Documents.findById(id);
  }

  // This method returns all the document in the database.
  async getDocuments(): Promise<DocumentsModel[]> {
    return Documents.find();
  }

  // This method returns all documents for a specific student.
  async getDocumentsByStudentId(studentId: string): Promise<DocumentsModel[]> {
    return Documents.find({ student: studentId });
  }

  // This method creates a bew document in the database.
  async createDocument(data: Partial<DocumentsModel>): Promise<DocumentsModel> {
    return Documents.create(data);
  }

  // This method updates a document in the database.
  async updateDocument(id: string, data: Partial<DocumentsModel>): Promise<DocumentsModel | null> {
    return Documents.findByIdAndUpdate(id, data, { new: true });
  }

  // This method deletes a document from the database.
  async deleteDocument(id: string): Promise<DocumentsModel | null> {
    return Documents.findByIdAndDelete(id);
  }

  // This method searches for a document in the database that matches the query object.
  async searchDocument(query: FilterQuery<DocumentsModel>): Promise<DocumentsModel | null> {
    return Documents.findOne(query);
  }

  // This method adds file URLs to the document's documents array (prevents duplicates)
  async addFilesToDocument(id: string, documents: string[]): Promise<DocumentsModel | null> {
    return Documents.findByIdAndUpdate(
      id,
      { $addToSet: { documents: { $each: documents } } },
      { new: true }
    );
  }

  // This method removes specific file URLs from the document's documents array
  async removeFilesFromDocument(id: string, documents: string[]): Promise<DocumentsModel | null> {
    return Documents.findByIdAndUpdate(id, { $pullAll: { documents: documents } }, { new: true });
  }

  async searchAndUpdate(
    query: FilterQuery<DocumentsModel>,
    update?: UpdateQuery<DocumentsModel>,
    options?: { multi?: boolean }
  ): Promise<DocumentsModel | null | { modifiedCount: number }> {
    if (!update) {
      return Documents.findOne(query);
    }

    if (options?.multi) {
      const result = await Documents.updateMany(query, update);
      return { modifiedCount: result.modifiedCount };
    }

    return Documents.findOneAndUpdate(query, update, { new: true });
  }
}
