const db = require("../config/db");

const getProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const [users] = await db.query(
      "SELECT id, name, email, skill_level, created_at FROM users WHERE id = ?",
      [userId]
    );
    if (users.length === 0) return res.status(404).json({ message: "User not found." });

    const [prefs] = await db.query(
      "SELECT dietary_tags, allergies FROM user_preferences WHERE user_id = ?",
      [userId]
    );
    const [ingredients] = await db.query(
      "SELECT ingredient, type FROM user_ingredient_prefs WHERE user_id = ?",
      [userId]
    );

    res.json({
      ...users[0],
      preferences: prefs[0] || { dietary_tags: [], allergies: [] },
      ingredient_prefs: ingredients,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, skill_level, dietary_tags, allergies, ingredient_prefs } = req.body;

  try {
    // Update user basic info
    if (name || skill_level) {
      await db.query(
        "UPDATE users SET name = COALESCE(?, name), skill_level = COALESCE(?, skill_level) WHERE id = ?",
        [name, skill_level, userId]
      );
    }

    // Update preferences
    if (dietary_tags !== undefined || allergies !== undefined) {
      const [existing] = await db.query(
        "SELECT id FROM user_preferences WHERE user_id = ?", [userId]
      );
      if (existing.length > 0) {
        await db.query(
          "UPDATE user_preferences SET dietary_tags = ?, allergies = ? WHERE user_id = ?",
          [JSON.stringify(dietary_tags || []), JSON.stringify(allergies || []), userId]
        );
      } else {
        await db.query(
          "INSERT INTO user_preferences (user_id, dietary_tags, allergies) VALUES (?, ?, ?)",
          [userId, JSON.stringify(dietary_tags || []), JSON.stringify(allergies || [])]
        );
      }
    }

    // Update ingredient preferences (replace all)
    if (Array.isArray(ingredient_prefs)) {
      await db.query("DELETE FROM user_ingredient_prefs WHERE user_id = ?", [userId]);
      for (const pref of ingredient_prefs) {
        if (pref.ingredient && pref.type) {
          await db.query(
            "INSERT INTO user_ingredient_prefs (user_id, ingredient, type) VALUES (?, ?, ?)",
            [userId, pref.ingredient, pref.type]
          );
        }
      }
    }

    res.json({ message: "Profile updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

module.exports = { getProfile, updateProfile };
