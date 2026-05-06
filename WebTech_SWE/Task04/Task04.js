const express=require("express");
const mysql=require("mysql2");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");

const app=express();

app.use(express.json());

const db=mysql.createConnection(
{
    host:"localhost",
    user:"root",
    password:"your_password",
    database:"task_manager"
});

db.connect(err=>
{
    if(err)
    {
        throw err;
    }

    console.log("MySQL Connected");
});

const auth=(req,res,next)=>
{
    const token=req.header("Authorization");

    if(!token)
    {
        return res.status(401).json(
        {
            error:"No token"
        });
    }

    try
    {
        const decoded=jwt.verify(token,"secretkey");

        req.user=decoded;

        next();
    }
    catch
    {
        res.status(400).json(
        {
            error:"Invalid token"
        });
    }
};

const role=(role)=>
(req,res,next)=>
{
    if(req.user.role!==role)
    {
        return res.status(403).json(
        {
            error:"Forbidden"
        });
    }

    next();
};

app.post("/register",(req,res)=>
{
    const { username,email,password }=req.body;

    const hash=bcrypt.hashSync(password,10);

    db.query(
        "INSERT INTO users (username,email,password) VALUES (?,?,?)",
        [username,email,hash],
        (err)=>
        {
            if(err)
            {
                return res.status(500).json(err);
            }

            res.json(
            {
                message:"User registered"
            });
        }
    );
});

app.post("/login",(req,res)=>
{
    const { email,password }=req.body;

    db.query(
        "SELECT * FROM users WHERE email=?",
        [email],
        (err,result)=>
        {
            if(err)
            {
                return res.status(500).json(err);
            }

            if(result.length===0)
            {
                return res.status(400).json(
                {
                    error:"User not found"
                });
            }

            const user=result[0];

            const valid=bcrypt.compareSync(
                password,
                user.password
            );

            if(!valid)
            {
                return res.status(400).json(
                {
                    error:"Wrong password"
                });
            }

            const token=jwt.sign(
                {
                    id:user.id,
                    role:user.role
                },
                "secretkey",
                {
                    expiresIn:"1h"
                }
            );

            res.json(
            {
                token
            });
        }
    );
});

app.post("/tasks",auth,(req,res)=>
{
    const { title,description,status }=req.body;

    db.query(
        "INSERT INTO tasks (title,description,status,user_id) VALUES (?,?,?,?)",
        [title,description,status,req.user.id],
        (err)=>
        {
            if(err)
            {
                return res.status(500).json(err);
            }

            res.json(
            {
                message:"Task created"
            });
        }
    );
});

app.get("/tasks",auth,(req,res)=>
{
    db.query(
        "SELECT * FROM tasks WHERE user_id=?",
        [req.user.id],
        (err,results)=>
        {
            if(err)
            {
                return res.status(500).json(err);
            }

            res.json(results);
        }
    );
});

app.put("/tasks/:id",auth,(req,res)=>
{
    const { id }=req.params;

    const { title,description,status }=req.body;

    db.query(
        "UPDATE tasks SET title=?,description=?,status=? WHERE id=? AND user_id=?",
        [title,description,status,id,req.user.id],
        (err,result)=>
        {
            if(err)
            {
                return res.status(500).json(err);
            }

            if(result.affectedRows===0)
            {
                return res.status(403).json(
                {
                    error:"Not allowed"
                });
            }

            res.json(
            {
                message:"Updated"
            });
        }
    );
});

app.delete("/tasks/:id",auth,(req,res)=>
{
    const { id }=req.params;

    db.query(
        "DELETE FROM tasks WHERE id=? AND user_id=?",
        [id,req.user.id],
        (err,result)=>
        {
            if(err)
            {
                return res.status(500).json(err);
            }

            if(result.affectedRows===0)
            {
                return res.status(403).json(
                {
                    error:"Not allowed"
                });
            }

            res.json(
            {
                message:"Deleted"
            });
        }
    );
});

app.get("/tasks/all",auth,role("admin"),(req,res)=>
{
    db.query(
        "SELECT * FROM tasks",
        (err,results)=>
        {
            if(err)
            {
                return res.status(500).json(err);
            }

            res.json(results);
        }
    );
});

app.listen(3000,()=>
{
    console.log("Server running on 3000");
});