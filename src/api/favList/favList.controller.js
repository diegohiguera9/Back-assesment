
const Fav = require("../fav/fav.model");
const User = require("../user/user.model");
const ErrroResponse = require("../utils/errorResponse");
const FavList = require("./favList.model");

module.exports = {
  async create(req, res, next) {
    try {
      const { userId, favs, name } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return next(new ErrroResponse("No user found", 400));
      }

      if (favs.length === 0) {
        return next(new ErrroResponse("At least one fav required", 400));
      }

      const favList = await FavList.create({ user: user._id, name });

      async function createFav(info) {
        try {
          const newFav = await Fav.create({ ...info, favList: favList._id });
          favList.favs.push(newFav);
          await favList.save({ validateBeforeSave: false });
        } catch (err) {
          next(err);
        }
      }

      await favs.reduce((acum, next) => {
        return acum.then(() => {
          return createFav(next);
        });
      }, Promise.resolve());

      user.favs.push(favList._id);
      await user.save({ validateBeforeSave: false });
      res.status(200).json({ favList });
    } catch (err) {
      next(err);
    }
  },

  async show(req, res, next) {
    try {
      const { userId } = req.body;
      const favId = req.params.id;

      const user = await User.findById(userId);

      if (!user) {
        return next(new ErrroResponse("No user found", 400));
      }

      const fav = await FavList.findById(favId).populate({
        path: "favs",
        select: "title description link -_id",
      });

      if (!fav) {
        return next(new ErrroResponse("No fav list found", 400));
      }

      if (!user._id.equals(fav.user)) {
        return next(new ErrroResponse("User not authorized to this list", 404));
      }

      res.status(200).json({ fav });
    } catch (err) {}
  },

  async delete(req, res, next) {
    try {
      const { userId } = req.body;
      const favId = req.params.id;

      const user = await User.findById(userId);
      const fav = await FavList.findById(favId);

      if (!user) {
        return next(new ErrroResponse("No user found", 400));
      }

      if (!fav) {
        return next(new ErrroResponse("No fav list found", 400));
      }

      if (!user._id.equals(fav.user)) {
        return next(new ErrroResponse("User not authorized to this list", 404));
      }

      const newFavs = user.favs.filter((item) => {
        return favId !== item.toString();
      });

      user.favs = newFavs;
      await user.save({ validateBeforeSave: false });

      async function deleteList(id) {
        try {
          await FavList.findByIdAndDelete(favId);
        } catch (err) {
          next(err);
        }
      }

      await deleteList(fav._id);

      res.status(200).json({ message: "Sucssesfully deleted" });
    } catch (err) {
      next(err);
    }
  },

  async showAll(req, res, next) {
    try {
      const { userId } = req.body;

      const user = await User.findById(userId).populate({
        path: "favs",
        select: "-user -__v",
        populate: {
          path: "favs",
          select: "title description link -_id",
        },
      });

      if (!user) {
        return next(new ErrroResponse("No user found", 400));
      }

      const { favs } = user;

      res.status(200).json({ favs });
    } catch (err) {
      next(err);
    }
  },
};
