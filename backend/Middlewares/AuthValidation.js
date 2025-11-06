const Joi = require('joi');

const signupValidation = (req,res,next)=>{

    const schema = Joi.object({
        
       mail: Joi.string().email().min(5).max(100).required(),
        password_hash: Joi.string().min(2).max(100).required(),
        role: Joi.string().min(2).max(100).required(),
        first_name: Joi.string().min(2).max(100).required(),
        last_name: Joi.string().min(2).max(100).required(),
        title: Joi.string().min(2).max(100).required(),
        phone: Joi.string().pattern(/^[0-9+\-\s]{7,15}$/).optional(),
        position: Joi.string().min(2).max(100).optional(),
        partner_id: Joi.string().optional().allow(null, ''),
        is_active: Joi.boolean().default(true),
        email_verified: Joi.boolean().default(false),
        last_login: Joi.date().optional().allow(null),
        preferences: Joi.object({
        language: Joi.string().default('en'),
        ui_settings: Joi.object().optional()
        }).optional()
    });

    const { error } = schema.validate(req.body);
    if(error){

        return res.status(400)
            .json({message:"Bad request", error})
    }

    next();
}


const loginValidation = (req,res,next)=>{

    const schema = Joi.object({
        mail: Joi.string().email().min(5).max(100).required(),
        password_hash: Joi.string().min(2).max(100).required(),
       
    });

    const { error } = schema.validate(req.body);
    if(error){

        return res.status(400)
            .json({message:"Bad request", error})
    }

    next();
}

module.exports={
    signupValidation,
    loginValidation
}