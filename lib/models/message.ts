import mongoose, { Schema } from 'mongoose'
import { z } from 'zod'

/**
 * Contact form submissions. Carried over from v1 with the triage fields it was
 * missing.
 *
 * Note what is NOT stored: the raw IP. The v1 API deliberately stopped saving
 * it ("Disable saving ip for safety", commit d265f46) and that decision stands.
 * A salted hash is enough to rate-limit and spot floods without holding
 * personal data that has no other use.
 */

export const zMessageInput = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.email('That email address does not look right').max(200),
  message: z.string().trim().min(10, 'Tell me a little more').max(5000),
  contactConsent: z.boolean().default(false),
  /** Honeypot. Real people never fill this; bots usually do. */
  website: z.string().max(0).optional(),
})
export type MessageInput = z.infer<typeof zMessageInput>

const MessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
    contactConsent: { type: Boolean, default: false },

    read: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false },
    spam: { type: Boolean, default: false },

    /** Cheap attribution: tells you which page actually converts. */
    sourcePage: { type: String, default: null },
    referrer: { type: String, default: null },

    meta: {
      userAgent: { type: String, default: null },
      country: { type: String, default: null },
    },
    ipHash: { type: String, default: null, index: true },
  },
  { timestamps: true }
)

MessageSchema.index({ createdAt: -1 })

export const MessageModel =
  mongoose.models.Message ?? mongoose.model('Message', MessageSchema)
