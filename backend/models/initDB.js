const db = require("../config/db");

db.serialize(() => {

  console.log("Initializing database...");

  // -----------------------------
  // USERS TABLE
  // -----------------------------
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT
    )
  `, (err) => {
    if (err) {
      console.error("Error creating users table:", err);
    } else {
      console.log("Users table ready");
    }
  });

  // -----------------------------
  // DROP OLD EXPENSES (DEV MODE)
  // -----------------------------
  

  // -----------------------------
  // EXPENSES TABLE (UPDATED)
  // -----------------------------
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      category TEXT,
      currency TEXT,
      date TEXT,
      createdAt TEXT,
      merchant TEXT,
      notes TEXT,
      items TEXT,
      source TEXT,
      userId INTEGER,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error("Error creating expenses table:", err);
    } else {
      console.log("Expenses table created successfully");
    }
  });

  console.log("Database initialization completed");

});