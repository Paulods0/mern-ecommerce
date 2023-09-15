const mongoose = require("mongoose")

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.ObjectId,
      ref: "categories",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    photo: {
      type: Buffer,
      contenteType: String,
    },
    shipping: {
      type: Boolean,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("products", ProductSchema)
