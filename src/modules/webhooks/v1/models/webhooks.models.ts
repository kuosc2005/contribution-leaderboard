import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import { IWebhook } from "../interface";

const WebhookSchema = new mongoose.Schema<IWebhook>(
  {
    username: {
      type: String,
      require: true,
    },
    userId: {
      type: Number,
      require: true,
    },
    type: {
      type: String,
      enum: ["commit", "issue"],
      require: true,
    },
    repositoryId: {
      type: Number,
      require: true,
    },
    repositoryName: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

WebhookSchema.plugin(paginate);

interface WebhookDocument extends mongoose.Document, IWebhook {}

export const Webhook = mongoose.model<
  WebhookDocument,
  mongoose.PaginateModel<WebhookDocument>
>("Webhooks", WebhookSchema);
