const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

let lastDeletedExpense = null;

// GET expenses
router.get("/", authMiddleware, (req, res) => {
  db.all(
    "SELECT * FROM expenses WHERE userId = ?",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// POST expense
router.post("/", authMiddleware, (req, res) => {
  const {
    amount,
    category,
    currency,
    date,
    merchant,
    notes,
    items,
    source
  } = req.body;

  db.run(
    `
    INSERT INTO expenses
    (amount, category, currency, date, createdAt, merchant, notes, items, source, userId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
    `,
    [
      amount,
      category,
      currency,
      date,

      new Date().toISOString(),

      merchant,
      notes,
      JSON.stringify(items),
      source,
      req.user.id
    ],
    function (err) {
      if (err) { 
        console.log(err);
         return res.status(500).json(err);
      }
      res.json({ message: "Expense added successfully" });
    }
  );
});

// DELETE LAST EXPENSE
router.delete("/delete-last", authMiddleware, (req, res) => {
  const userId = req.user.id;

  db.run(
    `DELETE FROM expenses
     WHERE id = (
       SELECT id FROM expenses
       WHERE userId = ?
       ORDER BY id DESC
       LIMIT 1
     )`,
    [userId],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Delete failed" });
      }
      res.json({ message: "Last expense deleted" });
    }
  );
});

// UPDATE LAST MATCHING AMOUNT
router.put("/update-amount", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { oldAmount, newAmount } = req.body;

  db.run(
    `UPDATE expenses
     SET amount = ?
     WHERE id = (
       SELECT id FROM expenses
       WHERE userId = ? AND amount = ?
       ORDER BY id DESC
       LIMIT 1
     )`,
    [newAmount, userId, oldAmount],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Update failed" });
      }
      res.json({ message: "Expense updated" });
    }
  );
});

// DELETE BY AMOUNT
router.delete("/delete-by-amount/:amount", authMiddleware, (req, res) => {

  const userId = req.user.id;
  const amount = Number(req.params.amount);

  db.get(
    `SELECT * FROM expenses
     WHERE userId = ? AND amount = ?
     ORDER BY id DESC LIMIT 1`,
    [userId, amount],
    (err, row) => {

      if (!row) {
        return res.status(404).json({ message: "Expense not found" });
      }

      lastDeletedExpense = row;

      db.run(
        `DELETE FROM expenses WHERE id = ?`,
        [row.id],
        function (err) {
          if (err) {
            return res.status(500).json({ message: "Delete failed" });
          }
          res.json({ message: "Expense deleted" });
        }
      );
    }
  );
});

// DELETE BY MERCHANT
router.delete("/delete-by-merchant/:name", authMiddleware, (req, res) => {

  const userId = req.user.id;
  const name = req.params.name.toLowerCase();

  db.get(
    `SELECT * FROM expenses
     WHERE userId = ?
     AND LOWER(merchant) LIKE ?
     ORDER BY id DESC LIMIT 1`,
    [userId, `%${name}%`],
    (err, row) => {

      if (!row) {
        return res.status(404).json({ message: "Not found" });
      }

      lastDeletedExpense = row;

      db.run(
        `DELETE FROM expenses WHERE id = ?`,
        [row.id],
        function (err) {
          if (err) {
            return res.status(500).json({ message: "Delete failed" });
          }
          res.json({ message: "Deleted successfully" });
        }
      );
    }
  );
});

router.put("/update-last", authMiddleware, (req, res) => {

  const userId = req.user.id;
  const { newAmount } = req.body;

  db.run(
    `UPDATE expenses
     SET amount = ?
     WHERE id = (
       SELECT id FROM expenses
       WHERE userId = ?
       ORDER BY id DESC LIMIT 1
     )`,
    [newAmount, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Update failed" });
      }

      res.json({ message: "Last expense updated" });
    }
  );
});

router.post("/undo-delete", authMiddleware, (req, res) => {

  if (!lastDeletedExpense) {
    return res.status(400).json({ message: "Nothing to undo" });
  }

  const expense = lastDeletedExpense;

  db.run(
    `INSERT INTO expenses
     (amount, category, currency, date, merchant, notes, items, source, userId)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      expense.amount,
      expense.category,
      expense.currency,
      expense.date,
      expense.merchant,
      expense.notes,
      expense.items,
      expense.source,
      expense.userId
    ],
    function (err) {

      if (err) {
        return res.status(500).json({ message: "Undo failed" });
      }

      lastDeletedExpense = null;
      res.json({ message: "Undo successful" });
    }
  );
});


// DELETE ALL USER EXPENSES
router.delete("/reset-all", authMiddleware, (req, res) => {
  const userId = req.user.id;

  db.run(
    "DELETE FROM expenses WHERE userId = ?",
    [userId],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Reset failed" });
      }
      res.json({ message: "All expenses deleted successfully" });
    }
  );
});



// DELETE EXPENSE

router.delete("/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);

  db.run(
    "DELETE FROM expenses WHERE id = ? AND userId = ?",
    [id, req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Delete failed" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.json({ message: "Expense deleted successfully" });
    }
  );
});

// UPDATE EXPENSE

router.put("/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const { amount, category, merchant, date } = req.body;

  db.run(
    `UPDATE expenses 
     SET amount=?, category=?, merchant=?, date=? 
     WHERE id=? AND userId=?`,
    [amount, category, merchant, date, id, req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Update failed" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.json({ message: "Expense updated successfully" });
    }
  );
});




module.exports = router;