// Use Express module and store function express in Express inside the app variable
const express = require("express");
const app = express();

// Router
const usersRouter = require("./routers/usersRouter");

// Recognize req.body as a JSON object
app.use(express.json());
app.use("/users", usersRouter);

// Catch error
app.use("*", (_err, _req, res, _next) => {
  res.send("error");
});

// Start server
app.listen(8000, () => console.log("Listening..."));
