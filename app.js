const express =  require('express');
const app = express()
const port = 5000;

const mongoose = require("mongoose");
const {mongoUrl} = require("./password");

const cors = require("cors");
app.use(cors())

require('./models/model')

require('./models/postapi')

app.use(express.json())
app.use(require("./routes/auth"))
app.use(require("./routes/create"))
app.use(require("./routes/user"))

mongoose.connect(mongoUrl);

mongoose.connection.on("connected", ()=>{
    
    console.log("Successfully connected to MongoDB")

})

mongoose.connection.on("Error", ()=>{
    
    console.log("Server unable to be connected to MongoDB")

})



app.listen(port, ()=>{
    console.log("Server is running on" + " " +  port)
})
