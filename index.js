const express = require("express");
const git = require("simple-git")();
const fs = require("fs");
const path = require("path");

const app = express();
const repoPath = path.resolve(__dirname); // Assuming the repo is the current directory
const commitMessage = "Automated commit triggered via Express.js";

// Root route
app.get("/", (req, res) => {
    res.send("Hello, visit /commit to trigger a Git commit.");
});

// Commit route
app.get("/commit", async (req, res) => {
    try {
        // Create or update a file in the repository
        const filePath = path.join(repoPath, "log.txt");
        const logContent = `Log entry: ${new Date().toISOString()}\n`;
        fs.appendFileSync(filePath, logContent);

        // Perform Git operations
        git.cwd(repoPath); // Set the working directory
        await git.add(".");
        await git.commit(commitMessage);
        await git.push("origin", "master"); // Replace "main" with your branch name if different

        console.log("Git commit and push successful.");
        res.send("Git commit and push successful.");
    } catch (error) {
        console.error("Error during Git commit:", error);
        res.status(500).send("An error occurred during Git commit.");
    }
});

// Start the server
app.listen(8000, () => {
    console.log("Server is running at http://localhost:8000");
});
