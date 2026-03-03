import mongoose, { Schema, model, models } from 'mongoose';

interface IClient {
  _id?: string;
  clientName: string;
  companyName: string;
  slug: string;
  fileUrl: string;
  fileType: 'pdf' | 'image';
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
    fileType: {
      type: String,
      enum: ['pdf', 'image'],
      required: [true, 'Please specify file type'],
    },
  },
  {
    timestamps: true,
  }
);

export default models.Client || model<IClient>('Client', clientSchema);
