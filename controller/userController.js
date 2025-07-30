const { query } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  console.log("ini request nya", req.body)

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

      return res.status(201).json({
        message: "User registered successfully",
        data: {
          user: registerUser.rows[0].username,
          email: registerUser.rows[0].email,
        },
      });
    } else {
      return res.status(409).json({
        message:"username atau email sudah terdaftar, mohon login"
      })
    }

  } catch (error) {
    console.error("error ketika melakukan register:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.login = async(req,res) =>{
  const{username, password} = req.body;
  try {
    const checkUser = await query(
      `SELECT * FROM table_user WHERE username = $1 `,
      [username]
    );

    if(checkUser.rows.length === 0){
      res.status(404).json({
        message:"user belum terdaftar"
      })
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
      message: "success",
      data: token
    });
    
  }catch (error) {
    console.error("Error ketika melakukan login", error);
    res.status(500).json({
      message:"Internal Server Error"
    })
    
  }
}

exports.userDetail = async(req,res) =>{
  const {id_user} = req.user;
  
  try {
    const userData = await query(`
      SELECT *
      FROM table_user
      WHERE id_user = $1
    `,[id_user])

    if(userData.rows.length === 0){
      return res.status(404).json({
        message:"user not found",
      })
    }
    res.status(200).json({
      message:"success",
      data: userData.rows[0]
    })
  }catch (error) {
    console.error("error ketika mengambil data user",error);
    res.status(500).json({
      message:"Internal Server Error"
    })
  }
}

exports.updateUserInfo = async(req,res) =>{
  const { username, email,password,newPassword} = req.body
  const {id_user} = req.user
  try {
    const updatedFields = {};
    if(username) updatedFields.username = username;
    if(email) updatedFields.email= email
    if(password) {
      const oldPasswordResult = await query(`SELECT password FROM table_user WHERE id_user =$1`,[id_user])

      const oldHashedPassword = oldPasswordResult.rows[0]?.password;

      if (!oldHashedPassword) {
        return res.status(400).json({ message: "User tidak ditemukan." });
      }

      const isMatch = await bcrypt.compare(password, oldHashedPassword);

      if (!isMatch) {
        return res.status(400).json({ message: "Password lama salah." });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      updatedFields.password = hashedNewPassword;
    }

    const setFields = Object.keys(updatedFields).map((key,index) => `${key}=$${index+1}`).join(',');
    const values = Object.values(updatedFields);
    
    const result = await query(`
        UPDATE table_user SET ${setFields} WHERE id_user= $${values.length + 1} RETURNING *
        `,[...values,id_user]
    )

    res.status(200).json({
        message:"success",
        data:result.rows
    })

  } catch (error) {
    console.log("error ketika mengupdate info user",error);
    res.status(500).json({
      message:"Internal Server Error"
    })  
    
  }
}


