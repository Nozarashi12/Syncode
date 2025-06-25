const Joi = require("joi");

// Signup Validation Schema
const signupSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

// Login Validation Schema
const loginSchema = Joi.object({
    usernameOrEmail: Joi.string().required(),
    password: Joi.string().min(6).required(),
});

// Middleware for validation
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ errors: error.details.map((err) => err.message) });
    }
    next();
};

module.exports = { validate, signupSchema, loginSchema };
