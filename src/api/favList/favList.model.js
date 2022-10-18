const { Schema, model } = require("mongoose");

const favListSchema = new Schema(
  {
    favs: {
      type: [{ type: Schema.Types.ObjectId, ref: "Fav" }],
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const FavList = model("FavList", favListSchema);

module.exports = FavList;
