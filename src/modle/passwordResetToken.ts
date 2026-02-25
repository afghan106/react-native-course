import { Schema, model, Document, Types } from "mongoose";
import { hash, genSalt, compare } from "bcrypt";

export interface resetPassword extends Document {
  owner: Types.ObjectId;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  compareToken(token: string): Promise<boolean>;
}

const passwordResetToken = new Schema<resetPassword>(
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
    createdAt: {
      type: Date,
      expires: 3600, // Token will expire after 1 hour
      default: Date.now,
    },
  },
  { timestamps: true }
);

passwordResetToken.pre("save", async function () {
  if (!this.isModified("token")) return;

  const salt = await genSalt(10);
  this.token = await hash(this.token, salt);
});

passwordResetToken.methods.compareToken = async function (token: string) {
  return compare(token, this.token);
};

export const PasswordResetTokenModel = model<resetPassword>(
  "PasswordResetToken",
  passwordResetToken
);
