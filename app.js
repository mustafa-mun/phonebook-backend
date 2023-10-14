const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const url = process.env.MONGODB_URI;
mongoose.set("strictQuery", false);
mongoose.connect(url).catch((err) => console.log(err));

const Person = require("./models/person");

app.use(express.static("dist"));
app.use(express.json());
app.use(cors());

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

morgan.token("content", (req) => {
  return JSON.stringify(req.body);
});
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :content"
  )
);

app.get("/info", async (req, res) => {
  const date = new Date();
  const persons = await Person.find();

  res.send(`
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${date.toUTCString()}</p>
  `);
});

app.get("/api/persons", async (_, res) => {
  try {
    const persons = await Person.find({});
    res.json(persons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/persons/:id", async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) {
      return res.status(404).json({ error: "not found" });
    }
    res.json(person);
  } catch (error) {
    next(error);
  }
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name) return res.status(400).json({ error: "name is missing" });
  if (!body.number) return res.status(400).json({ error: "number is missing" });

  const person = persons.find((person) => person.name === body.name);
  if (person) return res.status(400).json({ error: "name must be unique" });

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  });

  newPerson
    .save()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

app.put("/api/persons/:id", async (req, res, next) => {
  const body = req.body;

  if (!body.name) return res.status(400).json({ error: "name is missing" });
  if (!body.number) return res.status(400).json({ error: "number is missing" });

  const person = {
    name: body.name,
    number: body.number,
  };

  try {
    const updatedPerson = await Person.findByIdAndUpdate(
      req.params.id,
      person,
      {
        new: true,
      }
    );
    res.json(updatedPerson);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/persons/:id", async (req, res, next) => {
  try {
    const person = await Person.findByIdAndDelete(req.params.id);
    if (!person) {
      return res.status(404).json({ error: "not found" });
    }
  } catch (error) {
    next(error);
  }
  res.status(204).end();
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
