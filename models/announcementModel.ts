import mongoose, { Document, Schema } from "mongoose";

export interface AnnouncementModel extends Document {
  title: string;
  content: string;
  createdBy: Schema.Types.ObjectId;
}

const AnnouncementSchema = new Schema<AnnouncementModel>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Announcement = mongoose.model<AnnouncementModel>("Announcement", AnnouncementSchema);
