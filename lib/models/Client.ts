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
      match: [/^[a-zA-Z0-9\-_.~]+$/, 'Slug can only contain letters, numbers, hyphens (-), underscores (_), periods (.), and tildes (~)'],
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
