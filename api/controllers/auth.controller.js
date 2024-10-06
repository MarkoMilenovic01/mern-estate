import User from '../models/user.model.js'
import { errorHandler } from '../utils/error.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config();


export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;
  
    try {
      const hashedPassword = bcryptjs.hashSync(password, 10);
      const newUser = new User({ username, email, password: hashedPassword });
  
      await newUser.save();
  
      res.status(201).json("User created successfully!");
    } catch (error) {
      next(error);
    }
};


export const signin = async (req, res, next) => {  // Add 'next' here
    const { email, password } = req.body;

    try {
        // Check if user exists
        const validUser = await User.findOne({ email : email });
        if (!validUser) return next(errorHandler(404, "User not found!"));
        console.log("User:", validUser);
        console.log("Password from DB:", validUser.password);
        console.log("Entered Password:", password);

        // Validate password
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) return next(errorHandler(401, "Wrong credentials"));

        // Generate JWT token
        const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
        const {password : pass, ...rest} = validUser._doc;
        // Set token as httpOnly cookie
        res
            .cookie('access_token', token, { httpOnly: true })
            .status(200)
            .json(rest);
    } catch (error) {
        // Pass the error to the next middleware
        next(error);
    }
};