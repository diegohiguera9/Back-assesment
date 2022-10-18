const { model, Schema } = require("mongoose");

const favModel = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    link:{
      type: String,
      required: true
    },
    favList: {
      type: Schema.Types.ObjectId,
      ref: 'FavList',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Fav = model('Fav',favModel)

module.exports = Fav
