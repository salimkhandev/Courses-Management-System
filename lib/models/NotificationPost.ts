import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotificationPost extends Document {
  authorId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  attachments?: string[]; // local paths to images
  targetAudience: 'all' | 'students' | 'specific';
  targetUserIds?: mongoose.Types.ObjectId[];
  comments: any[];
  reactions: any[];
  priority: 'normal' | 'important' | 'urgent';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'love', 'celebrate', 'insightful'], required: true },
  createdAt: { type: Date, default: Date.now },
});

const ReplySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  content: { type: String, required: true, trim: true },
  reactions: [ReactionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const CommentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  content: { type: String, required: true, trim: true },
  reactions: [ReactionSchema],
  replies: { type: [ReplySchema], default: [] },
}, { timestamps: true });

const NotificationPostSchema = new Schema<INotificationPost>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    attachments: [{ type: String }],
    targetAudience: {
      type: String,
      enum: ['all', 'students', 'specific'],
      default: 'all',
    },
    targetUserIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [CommentSchema],
    reactions: [ReactionSchema],
    priority: {
      type: String,
      enum: ['normal', 'important', 'urgent'],
      default: 'normal',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes
NotificationPostSchema.index({ authorId: 1 });
NotificationPostSchema.index({ createdAt: -1 });
NotificationPostSchema.index({ isActive: 1 });

const NotificationPost: Model<INotificationPost> =
  mongoose.models.NotificationPost ?? mongoose.model<INotificationPost>('NotificationPost', NotificationPostSchema);

export default NotificationPost;