require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path")

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const pool = new Pool({
  user: process.env.DB_USER,
  host: "localhost",
  database: "formula_sheet_hub",
  password: process.env.DB_PASS,
  port: 5432,
});

// Server route
app.get("/", (req, res) => {
  res.send("Formula Sheet Hub Backend is Running! 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log("Token received:", token); // Log the token here
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach user info to request
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token." });
  }
};

// User Registration Route
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Please provide all required fields." });
  }

  const checkUserQuery = "SELECT * FROM users WHERE email = $1";
  const { rows } = await pool.query(checkUserQuery, [email]);

  if (rows.length > 0) {
    return res.status(400).json({ message: "User already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const insertUserQuery = "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id";
  const newUser = await pool.query(insertUserQuery, [username, email, hashedPassword]);

  const userId = newUser.rows[0].user_id;
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.status(201).json({ message: "User created successfully", token });
});

// User Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide both email and password." });
  }

  const checkUserQuery = "SELECT * FROM users WHERE email = $1";
  const { rows } = await pool.query(checkUserQuery, [email]);

  if (rows.length === 0) {
    return res.status(400).json({ message: "User not found." });
  }

  const user = rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    return res.status(400).json({ message: "Incorrect password." });
  }

  const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.status(200).json({ message: "Login successful", token });
});

// Set up multer storage engine for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");  // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);  // Unique filename
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  }
});

// Upload Formula Sheet Route
app.post("/upload", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    const { title, description, user_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const fileSize = req.file.size;

    const viewsCount = 0;
    const favoritesCount = 0;
    const rating = 0;

    const insertQuery = `
      INSERT INTO formula_sheets (user_id, title, description, file_url, file_size, views_count, favorites_count, rating, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING sheet_id
    `;

    const result = await pool.query(insertQuery, [
      user_id, title, description, fileUrl, fileSize, viewsCount, favoritesCount, rating
    ]);

    res.status(201).json({
      message: "File uploaded successfully",
      sheet_id: result.rows[0].sheet_id,
      file_url: fileUrl,
      views_count: viewsCount,
      favorites_count: favoritesCount,
      rating: rating
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading file" });
  }
});

// Get Formula Sheets
app.get("/sheets", async (req, res) => {
  const fetchSheetsQuery = `
    SELECT fs.sheet_id, fs.title, fs.description, fs.file_url, u.username
    FROM formula_sheets fs
    JOIN users u ON fs.user_id = u.user_id
  `;

  const { rows } = await pool.query(fetchSheetsQuery);
  res.status(200).json({ sheets: rows });
});

// Favorite Formula Sheet Route
app.post("/favorite", authenticateToken, async (req, res) => {
  const { sheetId } = req.body;
  const { userId } = req.user;

  const checkFavoriteQuery = "SELECT * FROM favorites WHERE user_id = $1 AND sheet_id = $2";
  const { rows } = await pool.query(checkFavoriteQuery, [userId, sheetId]);

  if (rows.length > 0) {
    return res.status(400).json({ message: "You have already favorited this sheet." });
  }

  const insertFavoriteQuery = "INSERT INTO favorites (user_id, sheet_id) VALUES ($1, $2)";
  await pool.query(insertFavoriteQuery, [userId, sheetId]);

  res.status(200).json({ message: "Sheet favorited successfully!" });
});

app.put("/rate", authenticateToken, async (req, res) => {
    const { sheetId, rating } = req.body;
    const { userId } = req.user;
  
    // Validate the rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }
  
    // Check if the user has already rated this sheet
    const checkRatingQuery = "SELECT * FROM ratings WHERE user_id = $1 AND sheet_id = $2";
    const { rows } = await pool.query(checkRatingQuery, [userId, sheetId]);
  
    if (rows.length > 0) {
      // Update the rating if the user has already rated this sheet
      const updateRatingQuery = "UPDATE ratings SET rating = $1 WHERE user_id = $2 AND sheet_id = $3";
      await pool.query(updateRatingQuery, [rating, userId, sheetId]);
      return res.status(200).json({ message: "Rating updated successfully!" });
    }
  
    // If the user hasn't rated the sheet, add the rating
    const insertRatingQuery = "INSERT INTO ratings (user_id, sheet_id, rating) VALUES ($1, $2, $3)";
    await pool.query(insertRatingQuery, [userId, sheetId, rating]);
  
    res.status(200).json({ message: "Sheet rated successfully!" });

      // Update the rating on the formula sheet
  const updateSheetRatingQuery = `
  UPDATE formula_sheets
  SET rating = (SELECT AVG(rating) FROM ratings WHERE sheet_id = $1)
  WHERE sheet_id = $1
`;
await pool.query(updateSheetRatingQuery, [sheetId]);
});
  

app.get("/sheets", async (req, res) => {
    const { sortBy } = req.query;  // Accepts sort criteria as a query parameter
  
    let orderByClause = "ORDER BY created_at DESC";  // Default: Sort by creation date
  
    if (sortBy === "views") {
      orderByClause = "ORDER BY views_count DESC";
    } else if (sortBy === "favorites") {
      orderByClause = "ORDER BY favorites_count DESC";
    } else if (sortBy === "rating") {
      orderByClause = "ORDER BY rating DESC";
    }
  
    const fetchSheetsQuery = `
      SELECT fs.sheet_id, fs.title, fs.description, fs.file_url, fs.views_count, fs.favorites_count, fs.rating, u.username
      FROM formula_sheets fs
      JOIN users u ON fs.user_id = u.user_id
      ${orderByClause}
    `;
  
    const { rows } = await pool.query(fetchSheetsQuery);
    res.status(200).json({ sheets: rows });
  });

app.get("/profile", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  const fetchUserProfileQuery = `
    SELECT u.username, u.email, fs.title AS uploaded_sheets
    FROM users u
    LEFT JOIN formula_sheets fs ON fs.user_id = u.user_id
    WHERE u.user_id = $1
  `;

  const { rows } = await pool.query(fetchUserProfileQuery, [userId]);

  if (rows.length === 0) {
    return res.status(404).json({ message: "User not found." });
  }

  res.status(200).json({ profile: rows[0] });
});
app.put("/sheets/:id", authenticateToken, async (req, res) => {
    const { title, description } = req.body;
    const sheetId = req.params.id;
    const userId = req.user.userId;
  
    const checkOwnershipQuery = `
      SELECT * FROM formula_sheets WHERE sheet_id = $1 AND user_id = $2
    `;
  
    const { rows } = await pool.query(checkOwnershipQuery, [sheetId, userId]);
  
    if (rows.length === 0) {
      return res.status(403).json({ message: "You can only update your own formula sheets." });
    }
  
    const updateQuery = `
      UPDATE formula_sheets
      SET title = $1, description = $2
      WHERE sheet_id = $3
    `;
  
    await pool.query(updateQuery, [title, description, sheetId]);
    res.status(200).json({ message: "Formula sheet updated successfully." });
  });
app.delete("/sheets/:id", authenticateToken, async (req, res) => {
  const sheetId = req.params.id;
  const userId = req.user.userId;

  const checkOwnershipQuery = `
    SELECT * FROM formula_sheets WHERE sheet_id = $1 AND user_id = $2
  `;

  const { rows } = await pool.query(checkOwnershipQuery, [sheetId, userId]);

  if (rows.length === 0) {
    return res.status(403).json({ message: "You can only delete your own formula sheets." });
  }

  const deleteQuery = `
    DELETE FROM formula_sheets WHERE sheet_id = $1
  `;

  await pool.query(deleteQuery, [sheetId]);
  res.status(200).json({ message: "Formula sheet deleted successfully." });
});

app.delete("/favorite", authenticateToken, async (req, res) => {
    const { sheetId } = req.body;
    const { userId } = req.user;
  
    // Check if the user has already favorited this sheet
    const checkFavoriteQuery = "SELECT * FROM favorites WHERE user_id = $1 AND sheet_id = $2";
    const { rows } = await pool.query(checkFavoriteQuery, [userId, sheetId]);
  
    if (rows.length === 0) {
      return res.status(400).json({ message: "You haven't favorited this sheet yet." });
    }
  
    // Remove from the favorites table
    const deleteFavoriteQuery = "DELETE FROM favorites WHERE user_id = $1 AND sheet_id = $2";
    await pool.query(deleteFavoriteQuery, [userId, sheetId]);
  
    res.status(200).json({ message: "Sheet unfavorited successfully!" });

    // Update the favorites count on the formula sheet
  const updateSheetFavoritesQuery = `
    UPDATE formula_sheets
    SET favorites_count = favorites_count - 1
    WHERE sheet_id = $1
  `;
  await pool.query(updateSheetFavoritesQuery, [sheetId]);

});
  