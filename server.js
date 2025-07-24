require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: '*', 
  methods: ["GET", "POST", "PUT", "DELETE"], 
};


app.use(cors(corsOptions))



const userRoutes = require('./routes/userRoutes');
const actRoutes = require('./routes/activityRoutes')

app.use("/api/v1/acts",actRoutes);
app.use("/api/v1/users",userRoutes)

app.use((req,res,next) => {
  res.status(404).json({ error: "API Route Not Found"})
})

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});