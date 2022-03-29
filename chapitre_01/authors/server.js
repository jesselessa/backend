const express = require("express");
const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
});

const { Pool } = require("pg");
console.log(Pool);
const { bool } = require("joi");

const app = express();
app.use(express.json());

const Postgres = new Pool({ ssl: { rejectUnauthorized: false } });

// const authors = [
//   {
//     name: "Lawrence Nowell",
//     nationality: "UK",
//     books: ["Beowulf"],
//   },
//   {
//     name: "William Shakespeare",
//     nationality: "UK",
//     books: ["Hamlet", "Othello", "Romeo and Juliet", "MacBeth"],
//   },
//   {
//     name: "Charles Dickens",
//     nationality: "US",
//     books: ["Oliver Twist", "A Christmas Carol"],
//   },
//   {
//     name: "Oscar Wilde",
//     nationality: "UK",
//     books: ["The Picture of Dorian Gray", "The Importance of Being Earnest"],
//   },
// ];

// ROUTES

// All authors
app.get("/", async (_req, res) => {
  const authors = await Postgres.query("SELECT * FROM authors");
  console.log(res);

  res.json(authors.rows);
});

// With SQL
app.get("/", async (req, res) => {
  let authors;
  try {
    students = await Postgres.query("SELECT * FROM authors");
  } catch (err) {
    console.log(err);

    return res.status(400).json({
      message: "An error happened",
    });
  }

  app.get("/", (_req, res) => {
    res.send("Authors API");
  });

  // Authors by books
  app.get("/authors/:id/books", (req, res) => {
    const books = authors[req.params.id - 1].books;
    res.send(books.join(", "));
  });

  // With SQL
  app.get("/authors/:id/books", async (req, res) => {
    let books;
    try {
      books = await Postgres.query(
        "SELECT books FROM authors WHERE authors.id=$1",
        [req.params.id]
      );
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        message: "An error happened",
      });
    }
    res.json(books.rows);
  });

  // By id
  app.get("/authors/:id", (req, res) => {
    // const author = authors.find((x, index) => {
    // 	const id = index + 1;

    // 	return req.params.id === id.toString();
    // });

    const author = authors[req.params.id - 1];

    res.send(`${author.name}, ${author.nationality}`);
  });

  // With SQL
  app.get("/authors/:id", async (req, res) => {
    let authors;
    try {
      authors = await Postgres.query(
        "SELECT * FROM authors WHERE authors.id=$1",
        [req.params.id]
      );
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        message: "An error happened",
      });
    }
    res.json(authors.rows);
  });

  // app.get("/json/authors/:id", (req, res) => {
  //   const author = authors[req.params.id];
  //   delete author.books;
  //   res.json(author);
  // });

  // With SQL
  app.get("/authors/:id/books", async (req, res) => {
    let books;
    try {
      books = await Postgres.query(
        "SELECT books FROM authors WHERE authors.id=$1",
        [req.params.id]
      );
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        message: "Erorr: Please enter a number",
      });
    }
    res.json(books.rows);
  });

  // Handle errors
  app.get("*", (_req, res) => {
    res.status(404).send("Page not found");
  });

  // Start the server
  app.listen(8000, () => {
    console.log("Listening");
  });
});
