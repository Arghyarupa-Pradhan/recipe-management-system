const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const register = async (req, res) => {
  const { name, email, password, skill_level } = req.body;
  console.log("Registering user:", { name, email,password, skill_level });
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required." });
  }

  try {
    console.log("Checking for existing user with email:", email);
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    console.log("Existing users with email:", existing);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      "INSERT INTO users (name, email, password_hash, skill_level) VALUES (?, ?, ?, ?)",
      [name, email, hash, skill_level || "beginner"]
    );

    const userId = result.insertId;

    // Create empty preferences row
    await db.query(
      "INSERT INTO user_preferences (user_id, dietary_tags, allergies) VALUES (?, ?, ?)",
      [userId, JSON.stringify([]), JSON.stringify([])]
    );

    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.status(201).json({
      message: "Registration successful.",
      token,
      user: { id: userId, name, email, skill_level: skill_level || "beginner" },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({
      message: "Login successful.",
      token,
      user: { id: user.id, name: user.name, email: user.email, skill_level: user.skill_level },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

module.exports = { register, login };
