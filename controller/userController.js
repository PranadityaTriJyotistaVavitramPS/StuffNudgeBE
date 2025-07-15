const { query } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.userAuth = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const checkUser = await query(
      `SELECT * FROM table_user WHERE username = $1 OR email = $2`,
      [username, email]
    );

    if (checkUser.rows.length === 0) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const registerUser = await query(
        `INSERT INTO table_user (username, email, password)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [username, email, hashedPassword]
      );

      const token = jwt.sign(
        { id_user: registerUser.rows[0].id_user },
        process.env.JWT_SECRET
      );

      return res.status(201).json({
        message: "User registered successfully",
        data: {
          user: registerUser.rows[0].username,
          email: registerUser.rows[0].email,
          token
        },
      });
    }

    const isMatch = await bcrypt.compare(password, checkUser.rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id_user: checkUser.rows[0].id_user },
      process.env.JWT_SECRET
    );

    return res.status(200).json({
      message: "User authenticated successfully",
      data: {
        user: checkUser.rows[0].username,
        email: checkUser.rows[0].email,
        token,
      },
    });
  } catch (error) {
    console.error("Internal Server Error, controller userAuth:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};




