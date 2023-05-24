const mongoose=require('mongoose')
require('dotenv').config;

exports.DB=()=>{
    mongoose.connect(process.env.MONGO_DB,({
        useNewUrlParser:true,
        useUnifiedTopology:true,
    }))
    .then(()=>console.log('DB Connected Successfully'))
    .catch((err)=>{console.log('DB Connection Error')
        console.log(err);
        process.exit(1);
    });
};
