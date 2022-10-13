const User = require("../user/user.model");
const Fav = require("./fav.model");
const ErrroResponse = require("../utils/errorResponse");

module.exports = {
  async create(req, res, next) {
    try {
      const { userId, title, description } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return next(new ErrroResponse('No user found',400));
      }

      const newFav = {
        title,
        description,
        user,
      };

      const fav = await Fav.create(newFav);      
      user.favs.push(fav._id);
      await user.save({ validateBeforeSave: false });

      res.status(200).json({ fav });
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
        return next(new ErrroResponse('No user found',400));
      }

      const fav = await Fav.findById(favId)

      if(!fav){
        return next(new ErrroResponse('No fav list found',400))
      }

      if(!user._id.equals(fav.user)){
        return next(new ErrroResponse('User not authorized to this list',404))
      }

      res.status(200).json({fav})
    } catch (err) {
        next(err)
    }
  },

  async delete(req, res, next) {
    try {
      const { userId } = req.body;
      const favId = req.params.id;

      const user = await User.findById(userId);
      const fav = await Fav.findById(favId)

      if (!user) {
        return next(new ErrroResponse('No user found',400));
      }  
      
      if(!user._id.equals(fav.user)){
        return next(new ErrroResponse('User not authorized to this list',404))
      }

      const newFavs = user.favs.filter(item=>{
        return favId !== item.toString()
      })

      user.favs = newFavs
      await user.save({validateBeforeSave:false})

      await Fav.findByIdAndDelete(favId)

      res.status(200).json({message:'Sucssesfully deleted'})
    } catch (err) {
        next(err)
    }
  },

  async showAll(req,res,next){
    try{
      const { userId } = req.body;

      const user = await User.findById(userId).populate({
        path:'favs',
        select:'title description -_id'
      })
      
      if (!user) {
        return next(new ErrroResponse('No user found',400));
      }

      const {favs} = user
      
      res.status(200).json({favs})

    } catch(err){
      next(err)
    }
  }
};
