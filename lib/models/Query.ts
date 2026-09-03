import mongoose, { Schema, Document, Model } from 'mongoose';

export type QueryStatus = 'open' | 'answered' | 'closed';

export interface IQuery extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  question: string;
  answer?: string;
  answeredBy?: mongoose.Types.ObjectId; // admin who answered
  answeredAt?: Date;
  status: QueryStatus;
  isPublic: boolean; // if true, visible to other students as FAQ
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuerySchema = new Schema<IQuery>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    question: { type: String, required: true },
    answer: { type: String },
    answeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    answeredAt: { type: Date },
    status: {
      type: String,
      enum: ['open', 'answered', 'closed'],
      default: 'open',
    },
    isPublic: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes
QuerySchema.index({ userId: 1 });
QuerySchema.index({ status: 1 });
QuerySchema.index({ isPublic: 1 });

const Query: Model<IQuery> =
  mongoose.models.Query ?? mongoose.model<IQuery>('Query', QuerySchema);

export default Query;