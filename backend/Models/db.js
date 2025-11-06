const mongoose = require('mongoose');

const mongo_url = process.env.MONGO_CONN;

if(!mongo_url){
  console.error('MongoDB connection string missing! Please set MONGO_CONN in .env');
  process.exit(1);
}

mongoose.connect(mongo_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>{

    console.log('MongoDB Connected...');
}).catch((err)=>{

    console.log('MongoDB Connection Error',err);
})