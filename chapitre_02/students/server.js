const express = require("express");
const app = express();

// Communicate with server in JSON
app.use(express.json());

// Middleware
app.use((req, res, next) => {
  console.log("Request received");
  next();
});

const students = [
  {
    id: 1,
    name: "Jess",
    gender: "F",
  },
  {
    id: 2,
    name: "Lysiane",
    gender: "F",
  },
  {
    id: 3,
    name: "Pauline",
    gender: "F",
  },
  {
    id: 4,
    name: "Kevin",
    gender: "M",
  },
  {
    id: 5,
    name: "Chris",
    age: 21,
    gender: "F",
  },
];

// Routes
app.get("/students", (_req, res) => {
  res.json(students);
});

app.post("/students", (req, res) => {
  students.push(req.body);
  res.send(students);
});

app.get("*", (_req, res) => {
  res.status(404).send("Page not found");
});

// Start the server
app.listen(8000, () => {
  console.log("Listening");
});
