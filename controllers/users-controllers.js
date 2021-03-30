const { uuid } = require("uuidv4");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Dinesh",
    email: "dinesh@gmail.com",
    password: "xyz12345",
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Please provide valid inputs.", 404);
  }
  const { name, email, password } = req.body;
  const hasUser = DUMMY_USERS.find((u) => u.email === email);
  if (hasUser) {
    throw new HttpError("Could not create user, email already exists.", 422);
  }
  const createdUser = {
    id: uuid(),
    name,
    email,
    password,
  };
  DUMMY_USERS.push(createdUser);
  res.json(createdUser);
};

const login = (req, res, next) => {};

module.exports.getUsers = getUsers;
module.exports.signup = signup;
