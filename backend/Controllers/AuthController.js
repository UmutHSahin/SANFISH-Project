const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require("../Models/User");



const signup = async (req, res)=> {

    try{
        const{partner_id, position, phone, title, role, first_name, last_name, mail,password_hash } =req.body;
        const user= await UserModel.findOne({ mail })
        
        if(user){
            return res.status(409)
            .json({ message : 'User is already exist, you can login', success: false });

        }
        const userModel = new UserModel({partner_id, position, phone, title, role, first_name, last_name, mail,password_hash });
        userModel.password_hash = await bcrypt.hash(password_hash, 10);
        await userModel.save();
        res.status(201)
        .json({
            message : "Signup successfully" , success : true
        })


    }catch(err){
        res.status(500)
        .json({
            message : "Internal server error" , success : false,       error: err.message // hata detayını görmek için

        })

 
    }
}

const login = async (req, res)=> {

    try{
        const{mail, password_hash } =req.body;
        const user= await UserModel.findOne({ mail })
        const errorMsg = 'Auth failed email or password is wrong';

        if(!user){
            return res.status(403)
            .json({ message : errorMsg, success: false });

        }
        const isPassEqual = await bcrypt.compare(password_hash, user.password_hash);
      if(!isPassEqual){
           return res.status(403)
            .json({ message : errorMsg, success: false });

      }

      const jwtToken = jwt.sign(
        {mail: user.mail, _id: user._id},
    process.env.JWT_SECRET || 'temporary_test_secret_123',  // ✅ Fallback ekle
        { expiresIn: '24h'}
    
    )
        res.status(200)
        .json({
            message : "Login success" , 
            success : true,
            jwtToken,
            mail,
            name: user.first_name
        })


    }catch(err){
        res.status(500)
        .json({
            message : "Internal server error" , success : false,       error: err.message // hata detayını görmek için

        })


    }
}
module.exports ={
    
signup,
login
}