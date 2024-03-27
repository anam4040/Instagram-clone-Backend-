const express = require("express");

const router = express.Router();

const mongoose = require ("mongoose");
const USER = mongoose.model("USER");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const {Jwt_keys} = require("../password")

const login = require("../Middlewares/login");


router.get('/', (req,res)=> {
     res.send("Hello")
})




router.post("/signup", (req,res) => {
    const{name, userName, email, password}= req.body;
   if(!name || !email || !userName || !password) {
        return res.status(422).json({ error:"Please fill all neccessary fields"})
   }

   USER.findOne({$or:[{email:email}, {userName:userName}]}).then((savedUser) => {
    if(savedUser){
        return res.status(422).json({error:"Existing user with the same email or userName, please sign in"})
    }
    bcrypt.hash(password, 10).then((cryptedPassword) => {
       
        const user = new USER({
            name,
            email,
            userName,
            password:cryptedPassword
        })
    
        user.save()
        .then(user => {res.json({message: "Welcome to Instagram"})})
        .catch(err => {console.log(err)})
    })
    

   
})


})

router.post("/signin", (req,res) =>{
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(422).json({error:"PLease add your registered email id and password"})

    }
    USER.findOne({email: email}).then((savedUser)=>{
        if(!savedUser){
            return res.status(422).json({error:"Invalid email"})
        }
        bcrypt.compare(password, savedUser.password)
        .then((passwordMatched)=>
        {
             if (passwordMatched) {
               // return res.status(200).json({message:"Successfully Signed In"})
                
              const jwttoken = jwt.sign({_id:savedUser.id} ,Jwt_keys )
              const {_id,name,email,userName} = savedUser

              
              res.json({jwttoken,user:{_id,name,email,userName}})
              console.log({jwttoken,user:{_id,name,email,userName}})

             } else {
                return res.status(422).json
                ({error:"Invalid Password, please try again"})
             }
        })
        .catch(err=>console.log(err))
    })
})

module.exports = router;
