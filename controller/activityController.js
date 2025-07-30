const { query } = require('../db');
const bcrypt = require('bcrypt');

exports.addActivity = async(req,res) =>{
    const {activity_name, activity_date, items, description} = req.body;
    const {id_user} = req.user;

    console.log("ini yang diterima",req.body)

    try {
        const addActQuery = await query(`
            INSERT INTO activity_table
            (activity_name, activity_date, items,description, id_user)
            VALUES ($1,$2,$3,$4,$5) RETURNING *
        `,[activity_name,activity_date,items,description, id_user])

        return res.status(201).json({
            message:"success",
            data: addActQuery.rows
        })
        
    } catch (error) {
        console.error("Error ketika membuat aktifitas",error);
        res.status(500).json({
            message:"Internal Server Error"
        })
        
    }
}


function toJakartaDateString(utcDateString) {
  const date = new Date(utcDateString);
    console.log("ISO UTC     :", date.toISOString());
    console.log("Local String:", date.toString());
  const options = {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  const formatter = new Intl.DateTimeFormat('en-CA', options);
  return formatter.format(date); 
}


exports.getActivities = async(req,res) =>{
    const { id_user } = req.user;
    try {
        const getActivities = await query(`
            SELECT * 
            FROM activity_table
            WHERE id_user = $1    
        `,[id_user])

        const activities = getActivities.rows.map(row => {
            const activity_date = toJakartaDateString(row.activity_date);
            return {
                ...row,
                activity_date,
            };
        });
        return res.status(200).json({
            message:"success",
            data: activities
        })
        
    } catch (error) {
        console.error("Error ketika mengambil seluruh aktivitas",error);
        res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

exports.updateActivity = async(req,res) =>{
    const { activity_name, activity_date, items, activity_status, activity_urgency} = req.body
    const { id_activity } = req.params;
    console.log("ini req body", req.body);
    console.log("id_activity", id_activity);
    try {
        const updatedFields = {}

        if(activity_name)updatedFields.activity_name = activity_name;
        if(activity_date){
            const formattedDate = toJakartaDateString(activity_date);
            updatedFields.activity_date = formattedDate
        }
        if(items)updatedFields.items = items;
        if(activity_status)updatedFields.activity_status = activity_status
        if(activity_urgency)updatedFields.activity_urgency = activity_urgency

        const setFields = Object.keys(updatedFields).map((key,index) => `${key}=$${index+1}`).join(',');
        const values = Object.values(updatedFields);

        const result = await query(`
            UPDATE activity_table SET ${setFields} WHERE id_activity= $${values.length + 1} RETURNING *
            `,[...values,id_activity]
        )

        res.status(200).json({
            message:"success",
            data:result.rows
        })

        
    } catch (error) {
        console.error("Error ketika mengupdate aktivitas",error)
        res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

exports.deleteActivity = async(req,res) => {
    const { id_activity } = req.params;
    try {
        const checkActivity = await query(` 
            SELECT activity_name 
            FROM activity_table WHERE id_activity = $1`,
        [id_activity])

        if(checkActivity.rows.length === 0){
            return res.status(400).json({
                message:"Aktivitas tidak ditemukan"
            })
        }

        await query(`
            DELETE 
            FROM activity_table 
            WHERE id_activity = $1`
        ,[id_activity])

        res.status(200).json({
            message:"success"
        })
        
    } catch (error) {
        console.error("Error ketika menghapus aktivitas",error);
        res.status(404).json({
            message:"Internal Server Error"
        })
        
    }
}