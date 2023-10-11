const express = require("express");
const app = express();
const morgan = require("morgan");

app.use(express.json());

morgan.token("content", (req) => {
  return JSON.stringify(req.body);
});
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :content"
  )
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/info", (req, res) => {
  const date = new Date();

  res.send(`
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${date.toUTCString()}</p>
  `);
});

app.get("/api/persons", (_, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const note = persons.find((item) => item.id === Number(req.params.id));
  if (!note) {
    res.status(404).json({ error: "not found" }).end();
  }
  res.json(note);
});

const generateID = () => {
  return Math.floor(Math.random() * 1000);
};

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name) return res.status(400).json({ error: "name is missing" });
  if (!body.number) return res.status(400).json({ error: "number is missing" });

  const person = persons.find((person) => person.name === body.name);
  if (person) return res.status(400).json({ error: "name must be unique" });

  const newPerson = {
    id: generateID(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(newPerson);
  res.status(201).json(newPerson).end();
});

app.delete("/api/persons/:id", (req, res) => {
  const note = persons.find((item) => item.id === Number(req.params.id));
  if (!note) {
    res.status(404).json({ error: "not found" }).end();
  }

  persons = persons.filter((item) => item.id !== note.id);
  res.status(204).end();
});

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
