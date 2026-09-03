const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const User = require("./models/User");
const Project = require("./models/Project");
const Task = require("./models/Task");
const Comment = require("./models/Comment");

const app = express();
const PORT = 5000;


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json());

// Website ko public folder se run karega
app.use(express.static(path.join(__dirname, "public")));


// =====================================================
// MONGODB CONNECTION
// =====================================================

mongoose
    .connect(
        "mongodb://127.0.0.1:27017/CodeAlpha_ProjectManagement"
    )
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });


// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


// =====================================================
// TEST ROUTE
// =====================================================

app.get("/api", (req, res) => {
    res.json({
        message: "CodeAlpha Project Management API is running!"
    });
});


// =====================================================
// REGISTER
// =====================================================

app.post("/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({
                message: "Name, email and password are required"
            });

        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({
                message: "User already exists"
            });

        }

        const user = await User.create({
            name,
            email,
            password
        });

        res.status(201).json({
            message: "User registered successfully",
            user
        });

    } catch (error) {

        console.log("Registration error:", error);

        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });

    }

});


// =====================================================
// LOGIN
// =====================================================

app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                message: "Email and password are required"
            });

        }

        const user = await User.findOne({
            email,
            password
        });

        if (!user) {

            return res.status(401).json({
                message: "Invalid email or password"
            });

        }

        res.status(200).json({
            message: "Login successful",
            user
        });

    } catch (error) {

        console.log("Login error:", error);

        res.status(500).json({
            message: "Login failed",
            error: error.message
        });

    }

});


// =====================================================
// CREATE PROJECT
// =====================================================

app.post("/projects", async (req, res) => {

    try {

        const {
            name,
            description,
            owner
        } = req.body;

        if (!name || !owner) {

            return res.status(400).json({
                message: "Project name and owner are required"
            });

        }

        const project = await Project.create({
            name,
            description,
            owner,
            members: [owner]
        });

        res.status(201).json({
            message: "Project created successfully",
            project
        });

    } catch (error) {

        console.log("Project creation error:", error);

        res.status(500).json({
            message: "Project creation failed",
            error: error.message
        });

    }

});


// =====================================================
// GET ALL PROJECTS
// =====================================================

app.get("/projects", async (req, res) => {

    try {

        const projects = await Project.find();

        res.status(200).json(projects);

    } catch (error) {

        console.log("Get projects error:", error);

        res.status(500).json({
            message: "Failed to get projects",
            error: error.message
        });

    }

});


// =====================================================
// GET SINGLE PROJECT
// =====================================================

app.get("/projects/:projectId", async (req, res) => {

    try {

        const project = await Project.findById(
            req.params.projectId
        );

        if (!project) {

            return res.status(404).json({
                message: "Project not found"
            });

        }

        res.status(200).json(project);

    } catch (error) {

        res.status(500).json({
            message: "Failed to get project",
            error: error.message
        });

    }

});


// =====================================================
// CREATE TASK
// =====================================================

app.post("/tasks", async (req, res) => {

    try {

        const {
            title,
            description,
            project,
            assignedTo,
            status,
            priority,
            dueDate
        } = req.body;

        if (!title || !project || !assignedTo) {

            return res.status(400).json({
                message:
                    "Title, project and assignedTo are required"
            });

        }

        const task = await Task.create({

            title,

            description,

            project,

            assignedTo,

            status: status || "todo",

            priority: priority || "medium",

            dueDate: dueDate || null

        });

        res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {

        console.log("Task creation error:", error);

        res.status(500).json({
            message: "Task creation failed",
            error: error.message
        });

    }

});


// =====================================================
// GET ALL TASKS
// =====================================================

app.get("/tasks", async (req, res) => {

    try {

        const tasks = await Task.find();

        res.status(200).json(tasks);

    } catch (error) {

        console.log("Get tasks error:", error);

        res.status(500).json({
            message: "Failed to get tasks",
            error: error.message
        });

    }

});


// =====================================================
// GET SINGLE TASK
// =====================================================

app.get("/tasks/:taskId", async (req, res) => {

    try {

        const task = await Task.findById(
            req.params.taskId
        );

        if (!task) {

            return res.status(404).json({
                message: "Task not found"
            });

        }

        res.status(200).json(task);

    } catch (error) {

        res.status(500).json({
            message: "Failed to get task",
            error: error.message
        });

    }

});


// =====================================================
// UPDATE TASK
// =====================================================

app.put("/tasks/:taskId", async (req, res) => {

    try {

        const task = await Task.findByIdAndUpdate(
            req.params.taskId,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {

            return res.status(404).json({
                message: "Task not found"
            });

        }

        res.status(200).json({
            message: "Task updated successfully",
            task
        });

    } catch (error) {

        console.log("Task update error:", error);

        res.status(500).json({
            message: "Task update failed",
            error: error.message
        });

    }

});


// =====================================================
// DELETE TASK
// =====================================================

app.delete("/tasks/:taskId", async (req, res) => {

    try {

        const task = await Task.findByIdAndDelete(
            req.params.taskId
        );

        if (!task) {

            return res.status(404).json({
                message: "Task not found"
            });

        }

        // Task ke comments bhi delete kar do
        await Comment.deleteMany({
            task: req.params.taskId
        });

        res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (error) {

        console.log("Task delete error:", error);

        res.status(500).json({
            message: "Task deletion failed",
            error: error.message
        });

    }

});


// =====================================================
// ADD COMMENT TO TASK
// =====================================================

app.post("/tasks/:taskId/comments", async (req, res) => {

    try {

        const { userId, text } = req.body;

        const task = await Task.findById(
            req.params.taskId
        );

        if (!task) {

            return res.status(404).json({
                message: "Task not found"
            });

        }

        if (!userId || !text) {

            return res.status(400).json({
                message: "userId and text are required"
            });

        }

        const user = await User.findById(userId);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        const comment = await Comment.create({

            task: req.params.taskId,

            user: userId,

            text

        });

        res.status(201).json({

            message: "Comment added successfully",

            comment: {

                _id: comment._id,

                task: {
                    id: task._id,
                    title: task.title
                },

                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },

                text: comment.text,

                createdAt: comment.createdAt,

                updatedAt: comment.updatedAt

            }

        });

    } catch (error) {

        console.log("Comment error:", error);

        res.status(500).json({
            message: "Comment creation failed",
            error: error.message
        });

    }

});


// =====================================================
// GET COMMENTS OF TASK
// =====================================================

app.get("/tasks/:taskId/comments", async (req, res) => {

    try {

        const comments = await Comment.find({
            task: req.params.taskId
        })
        .populate("user", "name email")
        .sort({ createdAt: 1 });

        res.status(200).json(comments);

    } catch (error) {

        console.log("Get comments error:", error);

        res.status(500).json({
            message: "Failed to get comments",
            error: error.message
        });

    }

});


// =====================================================
// DELETE COMMENT
// =====================================================

app.delete("/comments/:commentId", async (req, res) => {

    try {

        const comment = await Comment.findByIdAndDelete(
            req.params.commentId
        );

        if (!comment) {

            return res.status(404).json({
                message: "Comment not found"
            });

        }

        res.status(200).json({
            message: "Comment deleted successfully"
        });

    } catch (error) {

        console.log("Comment delete error:", error);

        res.status(500).json({
            message: "Comment deletion failed",
            error: error.message
        });

    }

});


// =====================================================
// 404 ROUTE
// =====================================================

app.use((req, res) => {

    res.status(404).json({
        message: "Route not found"
    });

});


// =====================================================
// SERVER START
// =====================================================

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});


// ======================================================
// DELETE COMMENT
// ======================================================

app.delete("/comments/:id", async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        res.status(200).json({
            message: "Comment deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Comment deletion failed",
            error: error.message
        });
    }
});


// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});