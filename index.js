const express = require("express");
const cors = require("cors");
const fs = require('fs');
const path = './data.json';
const mongoose = require('mongoose');
const port = process.env.PORT || 3001;

const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/medicineDB', {
  // useNewUrlParser: true,
  // useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define a schema and model for medicine


// Define the medicine schema
const medicineSchema = new mongoose.Schema({
  'ID': { type: String,  }, // Ensure ID is a string
  'SERIAL NUMABER': { type: String, required: true },
  'MEDICINE NAME': { type: String, required: true },
  'USE': String,
  'COMPANY NAME': { type: String, required: true },
  'MANUFACTURE DATE': String,
  'EXPIRY DATE': String,
  'CONTACT': String,
});

// Create the Medicine model
const Medicine = mongoose.model('Medicine', medicineSchema);

// Function to read data from data.json file
const readDataFromFile = () => {
  try {
    const data = fs.readFileSync(path, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
};

// Function to write data back to data.json file
const writeDataToFile = (data) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
};

// GET route to retrieve all medicines from MongoDB
app.get("/service", async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.send(medicines);
  } catch (error) {
    res.status(500).send({ msg: 'Error reading data from MongoDB' });
  }
});

// GET route to retrieve a medicine by ID from MongoDB
// GET route to retrieve a medicine by ID
app.get('/service/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const medicine = await Medicine.findOne({ 'ID': id });

    if (medicine) {
      res.send(medicine);
    } else {
      res.status(404).send({ msg: 'Medicine not found' });
    }
  } catch (error) {
    res.status(500).send({ msg: 'Error retrieving data from MongoDB' });
  }
});


// POST route to add a new medicine to MongoDB
// POST route to add a new medicine to MongoDB
app.post('/service', async (req, res) => {
  const newMedicine = req.body;

  // Check if required fields are present
  if (!newMedicine['MEDICINE NAME'] || !newMedicine['COMPANY NAME']) {
    return res.status(400).send({ msg: 'Medicine name and company name are required' });
  }

  try {
    const medicine = new Medicine(newMedicine);
    await medicine.save();
    res.status(201).send(medicine);
  } catch (error) {
    res.status(500).send({ msg: 'Error processing request to MongoDB' });
  }
});


// PUT route to update a medicine by ID in MongoDB
// PUT route to update a medicine by ID
app.put('/service/:id', async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  try {
    const medicine = await Medicine.findOneAndUpdate({ 'ID': id }, updatedData, { new: true });

    if (medicine) {
      res.send(medicine);
    } else {
      res.status(404).send({ msg: 'Medicine not found' });
    }
  } catch (error) {
    res.status(500).send({ msg: 'Error updating data in MongoDB' });
  }
});


// DELETE route to remove a medicine by ID from MongoDB
// DELETE route to remove a medicine by ID
app.delete('/service/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const medicine = await Medicine.findOneAndDelete({ 'ID': id });

    if (medicine) {
      res.send(medicine);
    } else {
      res.status(404).send({ msg: 'Medicine not found' });
    }
  } catch (error) {
    res.status(500).send({ msg: 'Error deleting data from MongoDB' });
  }
});


// Example GET route to retrieve all medicines from JSON file
app.get('/file-service', (req, res) => {
  try {
    const apiData = readDataFromFile();
    res.send(apiData);
  } catch (error) {
    res.status(500).send({ msg: 'Error reading data from file' });
  }
});

// Example POST route to add a new medicine to JSON file (not MongoDB)
app.post('/file-service', (req, res) => {
  const newMedicine = req.body;

  try {
    let medicines = readDataFromFile();
    const newId = medicines.length > 0 ? medicines[medicines.length - 1].ID + 1 : 1;
    newMedicine.ID = newId;
    medicines.push(newMedicine);
    writeDataToFile(medicines);
    res.status(201).send(newMedicine);
  } catch (error) {
    res.status(500).send({ msg: 'Error processing request to file' });
  }
});

// GET route to retrieve a medicine by ID from the JSON file
app.get('/file-service/:id', (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const medicines = readDataFromFile();
    const medicine = medicines.find(med => med.ID === id);

    if (medicine) {
      res.send(medicine);
    } else {
      res.status(404).send({ msg: 'Medicine not found' });
    }
  } catch (error) {
    res.status(500).send({ msg: 'Error processing request' });
  }
});

// PUT route to update a medicine by ID in the JSON file
app.put('/file-service/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updatedData = req.body;

  try {
    let medicines = readDataFromFile();
    let medicine = medicines.find(med => med.ID === id);

    if (medicine) {
      Object.assign(medicine, updatedData);
      writeDataToFile(medicines);
      res.send(medicine);
    } else {
      res.status(404).send({ msg: 'Medicine not found' });
    }
  } catch (error) {
    res.status(500).send({ msg: 'Error processing request' });
  }
});

// DELETE route to remove a medicine by ID from the JSON file
app.delete('/file-service/:id', (req, res) => {
  const id = parseInt(req.params.id);

  try {
    let medicines = readDataFromFile();
    const index = medicines.findIndex(med => med.ID === id);

    if (index !== -1) {
      const deletedMedicine = medicines.splice(index, 1)[0];
      writeDataToFile(medicines);
      res.send(deletedMedicine);
    } else {
      res.status(404).send({ msg: 'Medicine not found' });
    }
  } catch (error) {
    res.status(500).send({ msg: 'Error processing request' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
