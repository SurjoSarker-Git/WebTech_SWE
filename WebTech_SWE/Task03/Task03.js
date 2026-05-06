const express = require("express");

const app = express();

app.use(express.json());

let tasks = [];
let currentId = 1;

const validStatuses =
[
    "To Do",
    "In Progress",
    "Completed"
];

app.post("/tasks", (req, res) =>
{
    const { title, description, status } = req.body;

    if (!title)
    {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    if (status && !validStatuses.includes(status))
    {
        return res.status(400).json({
            error: "Invalid status"
        });
    }

    const newTask =
    {
        id: currentId++,
        title,
        description: description || "",
        status: status || "To Do"
    };

    tasks.push(newTask);

    res.status(201).json(newTask);
});

app.get("/tasks", (req, res) =>
{
    res.json(tasks);
});

app.get("/tasks/:id", (req, res) =>
{
    const id = parseInt(req.params.id);

    const task = tasks.find(t => t.id === id);

    if (!task)
    {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    res.json(task);
});

app.put("/tasks/:id", (req, res) =>
{
    const id = parseInt(req.params.id);

    const task = tasks.find(t => t.id === id);

    if (!task)
    {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    const { title, description, status } = req.body;

    if (status && !validStatuses.includes(status))
    {
        return res.status(400).json({
            error: "Invalid status"
        });
    }

    if (title !== undefined)
    {
        task.title = title;
    }

    if (description !== undefined)
    {
        task.description = description;
    }

    if (status !== undefined)
    {
        task.status = status;
    }

    res.json(task);
});

app.delete("/tasks/:id", (req, res) =>
{
    const id = parseInt(req.params.id);

    const index = tasks.findIndex(t => t.id === id);

    if (index === -1)
    {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    const deletedTask = tasks.splice(index, 1);

    res.json({
        message: "Task deleted",
        task: deletedTask[0]
    });
});

const PORT=3000;

app.listen(PORT, () =>
{
    console.log(`Server running on http://localhost:${PORT}`);
});