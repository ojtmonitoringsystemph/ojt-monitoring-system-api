import mongoose, { Document, Schema } from "mongoose";

// Purpose: Define the user model schema
export interface UserModel extends Document {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  password: string;
  avatar?: string;
  role: "admin" | "coordinator" | "student";
}

const UserSchema = new Schema<UserModel>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "coordinator", "student"],
      default: "student",
      required: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserModel>("User", UserSchema);
