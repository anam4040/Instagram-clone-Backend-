const express = require ("express");
const router = express.Router();
const mongoose = require("mongoose");


const POST = mongoose.model("POST");
const USER = mongoose.model("USER");

const login = require("../Middlewares/login");

//To get user Profile

router.get("/user/:id", async(req, res)=>{
    try{
        const user = await USER.findOne({_id: req.params.id}).select("-password");

        if(!user) {
            return res.status(404).json({error:"User not found"});
        }

        const posts = await POST.find({postedBy: req.params.id}).populate("postedBy", "id");
        return res.status(200).json({user, posts});
    }catch (err){
        return res.status(422).json({error: err.message});
    }
});


//to Follow user

// 

router.put("/follow", login, async (req, res) => {
    try {
      const followedUser = await USER.findByIdAndUpdate(
        req.body.followId,
        { $push: { followers: req.user._id } },
        { new: true }
      );
  
      if (!followedUser) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const currentUser = await USER.findByIdAndUpdate(
        req.user._id,
        { $push: { following: req.body.followId } },
        { new: true }
      );
  
      if (!currentUser) {
        return res.status(404).json({ error: "Current user not found" });
      }
  
      res.json(currentUser);
    } catch (err) {
      res.status(422).json({ error: err.message });
    }
  });

//to Unfollow user

// router.put("/unfollow",login, (req,res)=>{
//     USER.findByIdAndUpdate(req.body.followId,{
//        $pull:{followers: req.user._id}
//     },{
//        new: true
//     },(err, result)=>{
//        if(err){
//            return res.status(422).json({error:err})
//        }
//        USER.findByIdAndUpdate(req.user._id,{
//            $pull:{following: req.body.followId}
//        },{
//            new:true
//        }).then(result => res.json(result))
//        .catch(err => {return res.status(422).json({error:err})})
//     }
//     )
//    })


router.put("/unfollow", login, async (req, res) => {
  try {
      const unfollowedUser = await USER.findByIdAndUpdate(
          req.body.followId,
          { $pull: { followers: req.user._id } },
          { new: true }
      );

      const user = await USER.findByIdAndUpdate(
          req.user._id,
          { $pull: { following: req.body.followId } },
          { new: true }
      );

      res.json(user);
  } catch (err) {
      res.status(422).json({ error: err.message });
    }
});

//To upload profile pic 
// router.put("/uploadProfilePic", login,(req,res)=>{
//     USER.findByIdAndUpdate(req.user._id,{
//         $set:{Photo:req.body.pic}
//     },{
//         new: true
//     }).exec((err,result)=>{
//         if(err){
//            return res.status(422).json({error:err})
//         }else{
//             res.json(result)
//         }
//     })
// })

router.put("/uploadProfilePic", login, (req, res) => {
  USER.findByIdAndUpdate(
      req.user._id,
      { $set: { Photo: req.body.pic } },
      { new: true }
  )
  .then(result => {
      res.json(result);
  })
  .catch(err => {
      res.status(422).json({ error: err.message });
  });
});

module.exports = router;