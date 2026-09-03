import mongoose, { Schema, Document, Model } from 'mongoose';

export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface IPhysicalClassRegistration extends Document {
  classId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: RegistrationStatus;
  paymentScreenshot?: string; // local path to screenshot
  totalFee: number;
  paidAmount: number;
  remainingAmount: number;
  paymentHistory: {
    amount: number;
    date: Date;
    screenshot?: string;
    notes?: string;
  }[];
  registrationDate: Date;
  completionDate?: Date;
  certificateIssued: boolean;
  certificateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PhysicalClassRegistrationSchema = new Schema<IPhysicalClassRegistration>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'PhysicalClass', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    paymentScreenshot: { type: String },
    totalFee: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, default: 0, min: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    paymentHistory: [{
      amount: { type: Number, required: true },
      date: { type: Date, required: true },
      screenshot: { type: String },
      notes: { type: String },
    }],
    registrationDate: { type: Date, required: true, default: Date.now },
    completionDate: { type: Date },
    certificateIssued: { type: Boolean, default: false },
    certificateId: { type: String },
  },
  { timestamps: true }
);

// Indexes
PhysicalClassRegistrationSchema.index({ classId: 1, userId: 1 }, { unique: true });
PhysicalClassRegistrationSchema.index({ status: 1 });
PhysicalClassRegistrationSchema.index({ userId: 1 });

const PhysicalClassRegistration: Model<IPhysicalClassRegistration> =
  mongoose.models.PhysicalClassRegistration ?? mongoose.model<IPhysicalClassRegistration>('PhysicalClassRegistration', PhysicalClassRegistrationSchema);

export default PhysicalClassRegistration;