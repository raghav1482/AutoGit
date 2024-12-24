const express = require("express");
const git = require("simple-git")();
const fs = require("fs");
const path = require("path");
const schedule = require("node-schedule");
require("dotenv").config();

const app = express();
const repoPath = path.resolve(__dirname, process.env.REPO_PATH || ""); // Path to your repo
const commitMessage = process.env.COMMIT_MESSAGE || "Automated commit triggered via Express.js";
const branchName = process.env.BRANCH_NAME || "master";

// Function to perform Git commit
async function performGitCommit() {
    try {
        // Create or update a file in the repository
        const filePath = path.join(repoPath, "log.txt");
        const logContent = `Log entry: ${new Date().toISOString()}\n`;
        fs.appendFileSync(filePath, logContent);

        // Perform Git operations
        git.cwd(repoPath); // Set the working directory
        await git.add(".");
        await git.commit(commitMessage);
        await git.push("origin", branchName);

        console.log("Git commit and push successful.");
    } catch (error) {
        console.error("Error during Git commit:", error);
    }
}

// Root route
app.get("/", (req, res) => {
    res.send("Hello, visit /commit to trigger a Git commit manually.");
});

// Commit route
app.get("/commit", async (req, res) => {
    try {
        await performGitCommit();
        res.send("Git commit and push successful.");
    } catch (error) {
        res.status(500).send("An error occurred during Git commit.");
    }
});

// Schedule automatic commits 3 times a day (e.g., 9 AM, 3 PM, 9 PM)
schedule.scheduleJob("0 9,15,21 * * *", () => {
    console.log("Running scheduled Git commit...");
    performGitCommit();
});

// Start the server
app.listen(8000, () => {
    console.log("Server is running at http://localhost:8000");
});
