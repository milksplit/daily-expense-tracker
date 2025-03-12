const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config(); // Load .env file

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Stop server if DB fails to connect
  });

// **Expense Schema (No Authentication Required)**
const expenseSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  note: { type: String, default: "" },
});

const Expense = mongoose.model("Expense", expenseSchema);

// **Get all expenses**
app.get("/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses", error });
  }
});

// **Add a new expense**
app.post("/expenses", async (req, res) => {
  try {
    const { name, amount, note } = req.body;
    const newExpense = new Expense({ name, amount, note });
    await newExpense.save();

    res.json(newExpense);
  } catch (error) {
    res.status(500).json({ message: "Error adding expense", error });
  }
});

// **Delete an expense**
app.delete("/expenses/:id", async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense", error });
  }
});

// **Edit an expense**
app.put("/expenses/:id", async (req, res) => {
  try {
    const { name, amount, note } = req.body;
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { name, amount, note },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: "Error updating expense", error });
  }
});

// **Start the server**
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
