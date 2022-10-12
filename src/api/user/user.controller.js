const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./user.model");
const ErrroResponse = require("../utils/errorResponse");

module.exports = {
  async create(req, res, next) {
    try {
      const data = req.body;

      const encPassword = await bcrypt.hash(data.password, 8);

      const newUser = {
        ...data,
        password: encPassword,
      };

      const user = await User.create(newUser);

      const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
        expiresIn: 60 * 60 * 24,
      });

      res.status(201).json({ token});
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return next(new ErrroResponse("No user with those credentials", 400));
      }

      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return next(new ErrroResponse("No valid password", 400));
      }

      const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
        expiresIn: 60 * 60 * 24,
      });

      res.status(200).json({ token });
    } catch (err) {
      next(err);
    }
  },
};
