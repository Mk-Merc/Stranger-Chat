import mongoose, { Schema, Document } from 'mongoose';

export interface IBlock extends Document {
  blockerID: string;
  blockedID: string;
  createdAt: Date;
}

const BlockSchema: Schema = new Schema({
  blockerID: { type: String, required: true, index: true },
  blockedID: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now }
});

// Prevent duplicate blocks
BlockSchema.index({ blockerID: 1, blockedID: 1 }, { unique: true });

export default mongoose.model<IBlock>('Block', BlockSchema);