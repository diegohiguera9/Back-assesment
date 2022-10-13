const { Schema, model, models } = require("mongoose");
const ErrroResponse = require("../utils/errorResponse");
const bcrypt = require("bcrypt");

const emailRegex = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
const passwordRegex = new RegExp(
  /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,14}$/
);

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      match: [emailRegex, "Not valid email"],
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
      required: true,
    },
    favs: {
      type: [{ type: Schema.Types.ObjectId, ref: "Fav" }],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  if (!passwordRegex.test(this.password)) {
    return next(
      new ErrroResponse(
        "Password must have at least a symbol, upper and lower case letters and a number",
        400
      )
    );
  }

  this.password = await bcrypt.hash(this.password, 8);

  return next();
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.id
    delete returnedObject.__v
    delete returnedObject.password
  }
})

const User = model("User", userSchema);

module.exports = User;
