const jwt = require('jsonwebtoken')

exports.isAuthenticated = (req,res,next) =>{
    try{
        const {authorization}  = req.headers

        const [_,token] = authorization.split(' ')
       
        if (!token) return res.status(400).send('No token provided')

        const {id} = jwt.verify(token,process.env.SECRET_KEY)

        req.body.userId = id

        next()

    } catch(err){
        next(err)
    }
}
