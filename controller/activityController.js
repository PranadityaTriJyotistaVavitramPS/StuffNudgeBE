const { query } = require('../db');
const bcrypt = require('bcrypt');

//buataktifitas
exports.addActivity = async(req,res) =>{
    const {activity_name, activity_date, items} = req.body;
    const {id_user} = req.user;

    try {

        const [month, day, year] = activity_date.split('/');
        const formattedDate = `${year}-${month}-${day}`;

        const addActQuery = await query(`
            INSERT INTO activity_table
            (activity_name, activity_date, items, id_user)
            VALUES ($1,$2,$3,$4) RETURNING *
        `,[activity_name,formattedDate,items, id_user])

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

exports.getActivities = async(req,res) =>{
    const { id_user } = req.user;
    try {
        const getActivities = await query(`
            SELECT id_activity, activity_name, activity_date 
            FROM activity_table
            WHERE id_user = $1    
        `,[id_user])

        return res.status(200).json({
            message:"success",
            data: getActivities.rows
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
    try {
        const updatedFields = {}

        if(activity_name)updatedFields.activity_name = activity_name;
        if(activity_date){
            const [month, day, year] = activity_date.split('/');
            const formattedDate = `${year}-${month}-${day}`;
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
        console.error("Error ketika mengupdate aktivitas")
        res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

exports.ActivityDetail = async(req,res) => {
    const { id_activity } = req.params
    try {
        const activityDetail = await query(`
            SELECT * 
            FROM activity_table  
            WHERE id_activity = $1  
        `,[id_activity])

        res.status(201).json({
            message:"success",
            data:activityDetail.rows[0]
        })
        
    } catch (error) {
        
    }
}

