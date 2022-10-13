const jwt = require("jsonwebtoken");
const ErrroResponse = require("../utils/errorResponse");

exports.isAuthenticated = (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return next(new ErrroResponse("No header provided", 400));
    }

    const [_, token] = authorization.split(" ");

    if (!token) {
      return next(new ErrroResponse("No token provided", 400));
    }

    const { id } = jwt.verify(token, process.env.SECRET_KEY);

    req.body.userId = id;

    next();
  } catch (err) {
    next(err);
  }
};
