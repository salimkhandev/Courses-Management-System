import mongoose, { Schema, Document, Model } from 'mongoose';

export type StoryStatus = 'pending' | 'approved' | 'rejected';

export interface ISuccessStory extends Document {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail: string;
  studentWhatsapp?: string;
  studentImagePath?: string;
  title: string;
  content: string;
  images: string[]; // local paths to images
  salesAmount?: number;
  platform?: string; // e.g., Amazon, eBay, etc.
  timeframe?: string; // e.g., "3 months", "6 months"
  status: StoryStatus;
  likes: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SuccessStorySchema = new Schema<ISuccessStory>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    studentWhatsapp: { type: String },
    studentImagePath: { type: String },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    images: [{ type: String }],
    salesAmount: { type: Number },
    platform: { type: String },
    timeframe: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    likes: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
SuccessStorySchema.index({ studentId: 1 });
SuccessStorySchema.index({ status: 1 });
SuccessStorySchema.index({ featured: 1 });
SuccessStorySchema.index({ createdAt: -1 });

const SuccessStory: Model<ISuccessStory> =
  mongoose.models.SuccessStory ?? mongoose.model<ISuccessStory>('SuccessStory', SuccessStorySchema);

export default SuccessStory;