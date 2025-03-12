import React, { useState, useEffect } from "react";

function Home() {
  const [expenses, setExpenses] = useState([]);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newNote, setNewNote] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchExpenses(); // Fetch expenses on mount
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch("http://localhost:5000/expenses");
      if (!res.ok) throw new Error("Failed to fetch expenses");

      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      alert("Could not load expenses. Please try again later.");
    }
  };

  const addExpense = async () => {
    if (newName.trim() === "" || newAmount === "" || isNaN(newAmount)) return;

    const newExpense = {
      name: newName.trim(),
      amount: Number(newAmount),
      note: newNote.trim(),
    };

    try {
      const res = await fetch("http://localhost:5000/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense),
      });

      if (res.ok) {
        const savedExpense = await res.json();
        setExpenses([...expenses, savedExpense]);
        setNewName("");
        setNewAmount("");
        setNewNote("");
      } else {
        console.error("Failed to add expense");
      }
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  const deleteExpense = async (id) => {
    setDeletingId(id);
    setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5000/expenses/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          setExpenses(expenses.filter((expense) => expense._id !== id));
        } else {
          console.error("Failed to delete expense");
        }
      } catch (err) {
        console.error("Error deleting expense:", err);
      }
      setDeletingId(null);
    }, 500);
  };

  const updateExpense = async (id) => {
    try {
      const updatedExpense = { name: editName, amount: Number(editAmount), note: editNote };
      const res = await fetch(`http://localhost:5000/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedExpense),
      });

      if (res.ok) {
        setExpenses(expenses.map((exp) => (exp._id === id ? { ...exp, ...updatedExpense } : exp)));
        setEditingId(null);
        setSavingId(id);
        setTimeout(() => setSavingId(null), 500);
      } else {
        console.error("Failed to update expense");
      }
    } catch (err) {
      console.error("Error updating expense:", err);
    }
  };

  return (
    <div className="expenses-container">
      <h1>Daily Expense Tracker</h1>
      <div className="input-group">
        <input
          type="text"
          placeholder="Expense Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value ? Number(e.target.value) : "")}
        />
        <input
          type="text"
          placeholder="Note (optional)"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <button onClick={addExpense}>Add Expense</button>
      </div>

      <ul>
        {expenses.map((expense) => (
          <li key={expense._id}>
            {editingId === expense._id ? (
              <div className="editing-container">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value ? Number(e.target.value) : "")}
                />
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Edit note"
                />
                <div className="button-group">
                  <button className="save-btn" onClick={() => updateExpense(expense._id)}>Save</button>
                  <button className="cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className={`expense-item ${deletingId === expense._id ? "delete-animate" : ""} ${savingId === expense._id ? "save-animate" : ""}`}>
                <strong>{expense.name}:</strong> ${expense.amount}
                {expense.note && <p style={{ fontSize: "14px", color: "#555" }}>Note: {expense.note}</p>}
                <div className="button-group">
                  <button onClick={() => {
                    setEditingId(expense._id);
                    setEditName(expense.name);
                    setEditAmount(expense.amount);
                    setEditNote(expense.note || "");
                  }}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => deleteExpense(expense._id)}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
