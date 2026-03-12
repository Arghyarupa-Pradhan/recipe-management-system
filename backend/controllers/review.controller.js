const db = require("../config/db");

const addOrUpdateReview = async (req, res) => {
  const userId = req.user.id;
  const { mealId } = req.params;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

  try {
    await db.query(
      `INSERT INTO reviews (user_id, meal_id, rating, comment)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), updated_at = NOW()`,
      [userId, mealId, rating, comment || null]
    );
    res.json({ message: "Review saved successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

const getReviewsForMeal = async (req, res) => {
  const { mealId } = req.params;
  try {
    const [reviews] = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.meal_id = ?
       ORDER BY r.created_at DESC`,
      [mealId]
    );

    const [avg] = await db.query(
      "SELECT AVG(rating) as average, COUNT(*) as total FROM reviews WHERE meal_id = ?",
      [mealId]
    );

    res.json({
      reviews,
      average: parseFloat(avg[0].average || 0).toFixed(1),
      total: avg[0].total,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

module.exports = { addOrUpdateReview, getReviewsForMeal };
