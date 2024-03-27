const express = require("express");

const router = express.Router();

const mongoose = require ("mongoose");
const login = require("../Middlewares/login");
const POST = mongoose.model("POST")


//route for  GET all posts

router.get("/allposts", login, (req, res) =>{
    POST.find()
        .populate("postedBy", "_id name Photo")
        .populate("comments.postedBy", "_id name")
        .sort("-createdAt")
        .then(posts => res.json(posts))
        .catch(err => console.log(err) )
})


//Routes for create posts element 

router.post("/create",login, (req, res)=>{
    const {body, pic}=req.body;
    console.log(pic)
    if(!body|| !pic){
        return res.status(422).json({error:"Please add all neccessary fields"})
    }
   
    console.log(req.user)

    const post = new POST({
        
        body,
        photo: pic,
        postedBy: req.user
    }) 

    post.save().then((result)=>{
       return res.json({post:result})
    }).catch(err=>console.log(err))

})

//Routes for getting my posts in profile

router.get("/myposts", login, (req, res)=>{
    POST.find({postedBy:req.user._id})
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .sort("-createdAt")
    .then(myposts =>{
        res.json(myposts)
    })
})

// Corrected Routes for Likes 
router.put("/like", login, async (req, res) => {
    try {
        const result = await POST.findByIdAndUpdate(req.body.postId, {
            $push: { likes: req.user._id }
        }, {
            new: true
        }).populate("postedBy", "_id name Photo")
        .exec();
        res.json(result);
    } catch (err) {
        res.status(422).json({ error: err.message });
    }
});




//Corrected routes for unlike posts

router.put("/unlike", login, async (req, res) => {
    try {
        const result = await POST.findByIdAndUpdate(req.body.postId, {
            $pull: { likes: req.user._id }
        }, {
            new: true
        }).populate("postedBy", "_id name Photo")
        .exec();
        res.json(result);
    } catch (err) {
        res.status(422).json({ error: err.message });
    }
});



// Corrected route for commnet

router.put("/comment", login, async (req, res) => {
    const comment = {
        comment: req.body.text,
        postedBy: req.user._id
    };
    try {
        const result = await POST.findByIdAndUpdate(req.body.postId, {
            $push: { comments: comment }
        }, {
            new: true
        }).populate("comments.postedBy", "_id name Photo")
          .populate("postedBy", "_id name")
          .exec();
        res.json(result);
    } catch (err) {
        res.status(422).json({ error: err.message });
    }
});


//Corrected Route for delete posts
router.delete("/deletePost/:postId", login, async (req, res) => {
    try {
        const post = await POST.findOne({ _id: req.params.postId })
            .populate("postedBy", "_id")
            .exec();

        if (!post) {
            return res.status(422).json({ error: "Post not found" });
        }

        if (post.postedBy._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Unauthorized access" });
        }
      console.log("post", post);
       const posts = await POST.findByIdAndDelete(req.params.postId)
      .populate("postedBy", "_id")
      .exec();
      console.log("posts", posts)
     //await post.remove();
        res.json({ message: "Successfully deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// to show following post
router.get("/myfollowingpost", login, (req,res)=>{
    POST.find({postedBy:{$in: req.user.following } })
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .then(posts=>{
        res.json(posts)
    })
    .catch(err=>{console.log(err)})
})



module.exports = router