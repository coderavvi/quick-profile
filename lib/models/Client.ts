import mongoose, { Schema, model, models } from 'mongoose';

interface IClient {
  _id?: string;
  clientName: string;
  companyName: string;
  slug: string;
  fileUrl: string;
  isActive: boolean;
  createdAt?: Date;
}

const clientSchema = new Schema<IClient>(
  {
    clientName: {
      type: String,
      required: [true, 'Please provide a client name'],
    },
    companyName: {
      type: String,
      required: [true, 'Please provide a company name'],
    },
    slug: {
      type: String,
      required: [true, 'Please provide a slug'],
      unique: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    fileUrl: {
      type: String,
      required: [true, 'Please provide a file URL'],
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default models.Client || model<IClient>('Client', clientSchema);
