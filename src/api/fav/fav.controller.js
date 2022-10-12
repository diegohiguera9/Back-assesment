const User = require("../user/user.model");
const Fav = require("./fav.model");
const ErrroResponse = require("../utils/errorResponse");

module.exports = {
  async create(req, res, next) {
    try {
      
      const { userId, title, description } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        res.status(400).json({ message: "No user found" });
      }

      const newFav = {
        title,
        description,
        user,
      };

      const fav = await Fav.create(newFav);
      user.favs.push(fav);
      await user.save({ validateBeforeSave: false });

      res.status(200).json({ message: "fav added", data: fav });
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
        res.status(400).json({ message: "No user found" });
      }

      const fav = await Fav.findById(favId)

      if(!fav){
        res.status(400).json({message:'No fav list found'})
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

      if (!user) {
        res.status(400).json({ message: "No user found" });
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
      
      if (!user){
        next(new ErrroResponse('No user found',400))
      }

      const {favs} = user
      
      res.status(200).json({favs})

    } catch(err){
      next(err)
    }
  }
};
