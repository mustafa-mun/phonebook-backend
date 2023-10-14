const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}
const password = process.argv[2];

const conn = `mongodb+srv://mustafamcm9:${password}@cluster0.hoxxijs.mongodb.net/phonebook?retryWrites=true&w=majority`;

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

const getAllPersons = async () => {
  const persons = await Person.find({});
  return persons;
};

mongoose.set("strictQuery", false);
mongoose.connect(conn).then(() => {
  if (process.argv.length === 3) {
    getAllPersons()
      .then((res) => {
        console.log(res);
        process.exit(0);
      })
      .catch((err) => {
        console.log(err);
        process.exit(1);
      });
  }

  if (process.argv.length === 4) {
    console.log("give name and number as an argument");
    process.exit(1);
  }

  const newPerson = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });
  newPerson.save().then(() => {
    console.log(
      `${process.argv[3]} is added to phonebook with number ${process.argv[4]}`
    );
    mongoose.connection.close();
  });
});
