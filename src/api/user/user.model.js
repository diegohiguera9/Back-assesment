const { Schema, model, models } = require("mongoose");

const emailRegex = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
const passwordRegex = new RegExp(
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/
);

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      match: [emailRegex,'Not valid email'],
      validate: [
        {
          async validator(email) {
            try {
              const user = await models.User.findOne({ email });
              return !user;
            } catch (err) {
              return false;
            }
          },
          message: "Email already exist",
        },
      ],
    },
    password: {
      type: String,
      required: [true, "Must write a password"],
      // match: [
      //   passwordRegex,
      //   "Password should contain at least one digit, one lower case, one upper case",
      // ],
      // minlength: [3, "Password must be 8 characters min"],
      // maxlength: [14, "Password must be 8 characters min"],
    },
    favs:{
        type:[{type:Schema.Types.ObjectId, ref:'Fav'}],
        required:false
    }
  },
  {
    timestamps: true,
  }
);

const User = model('User',userSchema)

module.exports = User
