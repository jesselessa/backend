const express = require("express");
const app = express();
const port = 8000;
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const upload = multer({ dest: "public/uploads/" });

//----------- MIDDLEWARES --------------//
app.use(express.json());
app.use((_req, _res, next) => {
  console.log("Request received");
  next();
});
app.use(cors());
app.use(express.static("public/uploads"));
//-------------- USERS DATA -------------------//
const users = [{ name: "Paul" }, { name: "Marie" }];

//------------- ROUTES ---------------------//
app.get("/", (_req, res) => {
  res.json({ message: "File sent !" });
});

app.get("/users", (_req, res) => {
  return res.status(201).json(users);
});

app.post("/user", upload.single("image"), (req, res) => {
  fs.renameSync(
    req.file.path,
    path.join(req.file.destination, req.file.originalname)
  );
  const userName = { name: req.body.name };

  users.push(userName);
  console.log(users);
  res.status(201).json({ message: "Image received !" });
});

app.use("*", (_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// START SERVER
app.listen(port, () =>
  console.log(`Server listening at : http//localhost:${port}`)
);
