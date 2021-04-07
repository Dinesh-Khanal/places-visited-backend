const { uuid } = require("uuidv4");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    //users = User.find({}, 'email name'); //This will return email and name
    users = await User.find({}, "-password"); //This will return all properties excluding password
  } catch (err) {
    const error = new HttpError(
      "Fetch request fail, please try again latter.",
      500
    );
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Please provide valid inputs.", 404));
  }
  const { name, email, password } = req.body;

  const createdUser = new User({
    name,
    email,
    password,
    image:
      "https://pbs.twimg.com/profile_images/749682406890823680/ZxsDU-jl.jpg",
    places: [],
  });
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up fail, please try again later", 500);
    return next(error);
  }
  res.json({ createdUser: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not login. Please try again later",
      500
    );
    return next(error);
  }
  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }
  res.json({ message: "Login successfull!" });
};

module.exports.getUsers = getUsers;
module.exports.signup = signup;
module.exports.login = login;
