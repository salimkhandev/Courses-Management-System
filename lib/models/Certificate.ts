import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICertificate extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId; // for online courses
  physicalClassId?: mongoose.Types.ObjectId; // for physical classes
  certificateId: string; // unique certificate number
  studentName: string;
  courseName: string;
  completionDate: Date;
  issueDate: Date;
  instructorName: string;
  studentImagePath?: string; // local path to student profile picture
  certificateImagePath?: string; // local path to generated certificate
  verificationCode: string; // for verification
  createdAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    physicalClassId: { type: Schema.Types.ObjectId, ref: 'PhysicalClass' },
    certificateId: { type: String, required: true, unique: true },
    studentName: { type: String, required: true },
    courseName: { type: String, required: true },
    completionDate: { type: Date, required: true },
    issueDate: { type: Date, required: true, default: Date.now },
    instructorName: { type: String, required: true },
    studentImagePath: { type: String },
    certificateImagePath: { type: String },
    verificationCode: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// Indexes
CertificateSchema.index({ studentId: 1 });
CertificateSchema.index({ certificateId: 1 });
CertificateSchema.index({ verificationCode: 1 });

const Certificate: Model<ICertificate> =
  mongoose.models.Certificate ?? mongoose.model<ICertificate>('Certificate', CertificateSchema);

export default Certificate;