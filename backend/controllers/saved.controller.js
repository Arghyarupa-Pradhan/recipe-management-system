const db = require("../config/db");

const saveRecipe = async (req, res) => {
  const userId = req.user.id;
  const { mealId } = req.params;
  const { meal_name, meal_thumb } = req.body;

  try {
    await db.query(
      `INSERT IGNORE INTO saved_recipes (user_id, meal_id, meal_name, meal_thumb)
       VALUES (?, ?, ?, ?)`,
      [userId, mealId, meal_name || "", meal_thumb || ""]
    );
    res.json({ message: "Recipe saved." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

const unsaveRecipe = async (req, res) => {
  const userId = req.user.id;
  const { mealId } = req.params;

  try {
    await db.query("DELETE FROM saved_recipes WHERE user_id = ? AND meal_id = ?", [
      userId,
      mealId,
    ]);
    res.json({ message: "Recipe removed from saved." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

const getSavedRecipes = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      "SELECT meal_id, meal_name, meal_thumb, saved_at FROM saved_recipes WHERE user_id = ? ORDER BY saved_at DESC",
      [userId]
    );
    res.json({ saved: rows });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

module.exports = { saveRecipe, unsaveRecipe, getSavedRecipes };
