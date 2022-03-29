// Use Express
const express = require("express");
// Use Router from Express
const router = express.Router();
// Joi library
const Joi = require("joi");

// Schema from Joi API
const schema = Joi.object({
  username: Joi.string().min(4).required(),

  email: Joi.string().email().required(),

  age: Joi.number().integer().min(1).max(99).required().strict(),

  city: Joi.string().required(),
});

const users = [
  {
    username: "Jess",
    email: "jess@mail.com",
    age: 20,
    city: "Paris",
  },
  {
    username: "Paul",
    email: "paul@mail.com",
    age: 33,
    city: "Lyon",
  },
];

// ROUTES

// All users
router.get("/", (_req, res) => {
  res.json(users);
});

// Add user to users list
router.post("/", (req, res) => {
  const user = req.body;

  const validationResult = schema.validate(user);

  if (validationResult.error) {
    return res.status(400).json({
      message: validationResult.error.details[0].message,
    });
  } else {
    users.push(user);
  }
  res.json({
    message: "user added",
    users,
  });
});

// User by username
router.get("/:username", (req, res) => {
  const user = users.find((user) => {
    return (
      req.params.username.toLowerCase().replace(" ", "-") ===
      user.username.toLowerCase().replace(" ", "-")
    );
  });
  res.json(user);
});

// BONUSES

// User's info depending on his id
router.get("id/:id", (req, res) => {
  return res.json(users[req.params.id - 1]);
});
// User's info depending on his email
router.get("email/:email", (req, res) => {
  const user = users.find((user) => {
    return user.email === req.params.email;
  });
  res.json(user);
});

// Export the router
module.exports = router;
