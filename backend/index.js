const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors= require('cors');
const AuthRouter = require('./Routers/AuthRouter')

require('dotenv').config();
require('./Models/db'); 

const PORT = process.env.PORT || 8080;

app.get('/ping',(req,res)=>{
res.send('PONG')

});

app.use(bodyParser.json());
app.use(cors());
app.use('/auth', AuthRouter);
//app.use('/home', AuthRouter);

app.listen(PORT, ()=>{
console.log('Server is running on ${PORT}'); 
});

setInterval(() => {
  console.log('Sunucu hala çalışıyor...');
}, 5000); // Her 5 saniyede bir mesaj yazdır


require('dotenv').config();
require('./Models/db'); 

// 🧪 TEST: JWT_SECRET yüklendi mi?
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing');
console.log('MONGO_CONN:', process.env.MONGO_CONN ? '✅ Loaded' : '❌ Missing');

