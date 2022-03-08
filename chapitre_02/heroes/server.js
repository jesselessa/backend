// import express, { json } from "express";
const express = require("express");
const path = require("path");

const app = express();

// Communicate with server in JSON
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// Function debug
function debug(_req, _res, next) {
  console.log("Request received");
  next();
}
// Function transformName
function transformName(req, _res, next) {
  req.body.name = req.body.name.toLowerCase();
  next;
}

const superHeroes = [
  {
    name: "Iron Man",
    power: ["money"],
    color: "red",
    isAlive: true,
    age: 46,
    image:
      "https://blog.fr.playstation.com/tachyon/sites/10/2019/07/unnamed-file-18.jpg?resize=1088,500&crop_strategy=smart",
  },
  {
    name: "Thor",
    power: ["electricity", "worthy"],
    color: "blue",
    isAlive: true,
    age: 300,
    image:
      "https://www.bdfugue.com/media/catalog/product/cache/1/image/400x/17f82f742ffe127f42dca9de82fb58b1/9/7/9782809465761_1_75.jpg",
  },
  {
    name: "Daredevil",
    power: ["blind"],
    color: "red",
    isAlive: false,
    age: 30,
    image:
      "https://aws.vdkimg.com/film/2/5/1/1/251170_backdrop_scale_1280xauto.jpg",
  },
];

// Route - All heroes
app.get("/heroes", debug, (_req, res) => {
  res.json(superHeroes);
});

// Heroes by name
app.get("/heroes/:name", debug, (req, res) => {
  const hero = superHeroes.find((hero) => {
    return req.params.name === hero.name;
  });
  res.json(hero);
});

// Heroes'powers
app.get("/heroes/:name/powers", debug, (req, res) => {
  const powers = superHeroes.find((hero) => {
    return req.params.name === hero.name;
  });
  res.json(powers.power);
});

// Add hero to list of superheroes
app.post("/heroes", debug, transformName, (req, res) => {
  superHeroes.push({
    // id: superheroes.length + 1,
    name: req.body.name,
    power: req.body.power,
    color: req.body.color,
    isAlive: req.body.isAlive,
    age: req.body.age,
    image: req.body.image || "http://localhost:8000/images/superhero.png",
  });
  res.json({
    message: "OK, hero added",
    superHeroes,
  });
});

// Catch error
app.get("*", debug, (_req, res) => {
  res.status(404).send("Page not found");
});

// Start the server
app.listen(8000, () => {
  console.log("Listening");
});
