const jwt = require("jsonwebtoken")
const {Jwt_keys} = require("../password")
const mongoose = require ("mongoose")
const USER = mongoose.model("USER")

module.exports = (req, res, nextFunction)=>{
    const {authorization} = req.headers;
    if(!authorization){
        return res.status(401).json({error:"Sign In to create a new post"})
    }
    
    const authToken = authorization.replace("Bearer ", "" )
    jwt.verify(authToken,Jwt_keys,(err, payload)=>{
       if(err){
        return res.status(401).json({error:"You need to Sign In first"})
       } 
       const {_id} = payload
       USER.findById(_id).then(userData=>{
       req.user = userData
         nextFunction()

       })
    })

    
}