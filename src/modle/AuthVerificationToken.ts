import { Schema, model, Document, Types } from "mongoose";
import { hash, genSalt, compare } from "bcrypt";

export interface Itoken extends Document {
  owner: Types.ObjectId;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  compareToken(token: string): Promise<boolean>;
}

const tokenSchema = new Schema<Itoken>(
  {
    owner:{
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

tokenSchema.pre("save", async function () {
  if (!this.isModified("token")) return;

  const salt = await genSalt(10);
  this.token = await hash(this.token, salt);
});

tokenSchema.methods.compareToken = async function (token: string) {
  return compare(token, this.token);
};

export const AuthVerification = model<Itoken>(
  "AuthVerification",
  tokenSchema
);
