import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVideo {
  _id: mongoose.Types.ObjectId;
  order: number;
  title: string;
  duration: number;   // seconds
  localPath: string;  // Local file path for VPS storage
  sizeBytes: number;
}

export interface ICourse extends Document {
  title: string;
  description: string;
  localThumbnailPath?: string;  // Local file path for VPS storage
  videos: IVideo[];
  price: number;          // enrollment fee in PKR
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    order: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    duration: { type: Number, required: true },
    localPath: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
  },
  { _id: true }
);

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    localThumbnailPath: { type: String, required: false },
    price: { type: Number, required: true, default: 5000 }, // PKR
    videos: { type: [VideoSchema], default: [] },
  },
  { timestamps: true }
);

const Course: Model<ICourse> =
  mongoose.models.Course ?? mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
