import mongoose from "mongoose";

export const User = mongoose.model(
  "User",
  new mongoose.Schema({
    email: String,
    password: String,
    roles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role"
    }]
  })
)