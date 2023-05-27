const express=require('express')
const app=express();
require('dotenv').config();

const PORT=process.env.PORT;

//middleware
app.use(express.json())

//server start
app.listen(PORT,()=>{
    console.log(`Server start seccussfully ${PORT}`)
});


