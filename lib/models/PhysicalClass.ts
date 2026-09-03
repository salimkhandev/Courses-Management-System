import mongoose, { Schema, Document, Model } from 'mongoose';

export type ClassStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface IPhysicalClass extends Document {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  schedule: string; // e.g., "Mon-Fri 6PM-8PM"
  totalSeats: number;
  availableSeats: number;
  fee: number;
  status: ClassStatus;
  instructor: string;
  createdAt: Date;
  updatedAt: Date;
}

const PhysicalClassSchema = new Schema<IPhysicalClass>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    schedule: { type: String, required: true },
    totalSeats: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true, min: 0 },
    fee: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    instructor: { type: String, required: true },
  },
  { timestamps: true }
);

// Indexes
PhysicalClassSchema.index({ status: 1 });
PhysicalClassSchema.index({ startDate: 1 });

const PhysicalClass: Model<IPhysicalClass> =
  mongoose.models.PhysicalClass ?? mongoose.model<IPhysicalClass>('PhysicalClass', PhysicalClassSchema);

export default PhysicalClass;