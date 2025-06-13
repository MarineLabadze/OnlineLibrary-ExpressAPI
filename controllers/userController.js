// const asyncHandler=require("express-async-handler");
// const bcrypt =require("bcryptjs");
// const jwt=require("jsonwebtoken");
// const User=require("../models/usermodel")
// // @desc Register a user
// // @route POST /api/users/register
// // @access Public
// const registerUser = asyncHandler(async (req, res)=>{
//     const {username,email,password} =req.body;
//     if(!username || !email || !password){
//         res.status(400);
//         throw new Error("All fields are mandatory!");
//     }
//     const userAvailable=await User.findOne({email});
//     if(userAvailable){
//         res.status(400);
//         throw new Error("User is already registered!");
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     console.log("hashed password", hashedPassword);
//     const user=await User.create({
//         username,
//         email,
//         password:hashedPassword,
//     });
//     console.log(`User created ${user}`);
//     if(user){
//         res.status(201).json({_id:user.id, email:user.email});
//     }else{
//         res.status(400);
//         throw new Error("User data not valid");
//     }
//    // res.json({message:"Register a user"});
// });

// // @desc Login a user
// // @route POST /api/users/login
// // @access Public
// const loginUser = asyncHandler(async (req, res) => {
//     const { email, password } = req.body;
//     if (!email || !password) {
//         res.status(400);
//         throw new Error("All fields are mandatory!");
//     }
//     const user = await User.findOne({ email });
//     if (user && (await bcrypt.compare(password, user.password))) {
//         const accessToken = jwt.sign(
//             {
//                 user: {
//                     username: user.username,
//                     email: user.email,
//                     id: user.id,
//                 },
//             },
//             process.env.ACCESS_TOKEN_SECRET,
//             { expiresIn: "15m" }
//         );
//         res.status(200).json({ accessToken });
//     } else {
//         res.status(401);
//         throw new Error("email or password is not valid!");
//     }
// });



// // @desc Current user info
// // @route POST /api/users/current
// // @access Private
// const currentUser = asyncHandler(async (req, res)=>{
// res.json(req.user);
// });
// module.exports={registerUser, loginUser, currentUser};


const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");

// @desc Register a user
// @route POST /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User is already registered!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        email,
        password: hashedPassword,
    });

    if (user) {
        console.log("User created", user);
        res.status(201).json({
            _id: user._id,
            email: user.email,
        });
    } else {
        res.status(400);
        throw new Error("User creation failed");
    }
});

// @desc Login a user
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign(
            {
                user: {
                    username: user.username,
                    email: user.email,
                    id: user._id,
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        res.status(200).json({ accessToken });
    } else {
        res.status(401);
        throw new Error("Email or password is not valid!");
    }
});

// @desc Current user info
// @route POST /api/users/current
// @access Private
const currentUser = asyncHandler(async (req, res) => {
    res.json(req.user);
});

module.exports = { registerUser, loginUser, currentUser };