// Use Express module
const express = require("express");
// Use Path module for working with file and directory paths
const path = require("path");
// Call the function "express()" in Express and put new Express application inside the app variable
const app = express();

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

// Middlewares
function debug(_req, _res, next) {
  console.log("Request received");
  next();
}

function transformName(req, _res, next) {
  if (req.body.name) {
    req.body.name = req.body.name.toLowerCase();
    next;
  }
}

function findHero(req, _res, next) {
  const hero = superHeroes.find((hero) => {
    // Iron Man -> iron man -> iron-man
    return (
      req.params.name.toLowerCase().replace(" ", "-") ===
      hero.name.toLowerCase().replace(" ", "-")
    );
  });

  req.hero = hero;
  next();
}

function protect() {
  // Check if user is logged
  return res.status(401).send("Login first");
}

// Other syntax : app.use(express.json(), debug);

// Recognize req.body as a JSON object
app.use(express.json());
app.use(debug);

// Use my image from my file "public"
app.use(express.static(path.join(__dirname, "public")));

// ROUTES

// All heroes
app.get("/heroes", (_req, res) => {
  res.json(superHeroes);
});

// Heroes by name
app.get("/heroes/:name", findHero, (req, res) => {
  res.json(req.hero);
});
// Other syntax - app.get("/heroes/:name", (req, res) => {
//   const hero = superHeroes.find((hero) => {
//     return req.params.name === hero.name;
//   });
//   res.json(hero);
// });

// Heroes'powers
app.get("/heroes/:name/powers", findHero, (req, res) => {
  res.json(req.hero.power);
});
// Other syntax - app.get("/heroes/:name/powers", (req, res) => {
//   const hero = superHeroes.find((hero) => {
//     return req.params.name === hero.name;
//   });
//   res.json(hero.power);
// });

// Catch error dans get()
app.get("*", (_req, res) => {
  res.status(404).send("Not found");
});

// Add hero to list of superheroes

app.post("/heroes", protect, transformName, (req, res, _) => {
  superHeroes.push(req.body);
  // Other syntax - superHeroes.push({
  //   name: req.body.name,
  //   power: req.body.power,
  //   color: req.body.color,
  //   isAlive: req.body.isAlive,
  //   age: req.body.age,
  //   image: req.body.image || "http://localhost:8000/images/superhero.png",
  // });
  res.status(201).json({
    message: "OK, hero added",
    superHeroes,
  });
});

// Add a power to a super hero
app.patch("/heroes/:name/powers", findHero, (req, res) => {
  const hero = req.hero;

  hero.power.push(req.body.power);

  res.json({
    message: "OK,power added",
    hero,
  });
});
// Other syntax - app.patch("/heroes/:name/powers", (req, res, _) => {
//   const hero = superHeroes.find((hero) => {
//     return hero.name === req.params.name;
//   });
//   superHeroes.power.push(req.body.power);
//   res.json({
//     message: "Power added !",
//     hero,
//   });
// });

// Start the server
app.listen(8000, () => {
  console.log("Listening...");
});
