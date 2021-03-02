import mongoose, { Model, Document } from 'mongoose';

export enum BeachDirection {
  N = 'N',
  S = 'S',
  E = 'E',
  W = 'W',
}

export interface BeachPosition {
  lat: number;
  lng: number;
  direction: BeachDirection;
}

export interface Beach {
  _id?: string;
  name: string;
  position: BeachPosition;
  user: string;
}

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      direction: { type: String, required: true },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

interface BeachModel extends Omit<Beach, '_id'>, Document {}
//export const Beach: Model<BeachModel> = mongoose.model('Beach', schema);
export const Beach: Model<BeachModel> = mongoose.model<BeachModel>(
  'Beach',
  schema
);
