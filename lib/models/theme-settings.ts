import mongoose, { Schema } from 'mongoose'

const ThemeSettingsSchema = new Schema(
  {
    _id: { type: String, enum: ['site'], default: 'site' },
    enabledThemes: { type: [String], required: true },
  },
  { timestamps: true }
)

export const ThemeSettingsModel =
  mongoose.models.ThemeSettings ??
  mongoose.model('ThemeSettings', ThemeSettingsSchema)
