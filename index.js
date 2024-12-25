const express = require("express");
const git = require("simple-git")();
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const repoPath = path.resolve(__dirname, process.env.REPO_NAME || "AutoGit");
const gitRepoUrl = `https://${process.env.GIT_PAT}@github.com/raghav1482/AutoGit.git`;
const branchName = process.env.BRANCH_NAME || "master";
const commitMessage = process.env.COMMIT_MESSAGE || "Automated commit triggered via Render";
const gitUserName = process.env.GIT_USER_NAME || "Your Name"; // Replace with your name
const gitUserEmail = process.env.GIT_USER_EMAIL || "your-email@example.com"; // Replace with your email

// Clone the repo if it doesn't exist
async function ensureRepoExists() {
    if (!fs.existsSync(repoPath)) {
        console.log(`Cloning repository from ${gitRepoUrl}...`);
        await git.clone(gitRepoUrl, repoPath);
        console.log("Repository cloned successfully.");
    } else {
        console.log("Repository already exists locally.");
    }
}

// Function to perform Git commit
async function performGitCommit() {
    try {
        const filePath = path.join(repoPath, "log.txt");
        const logContent = `Log entry: ${new Date().toISOString()}
`;

        // Ensure repo exists and write to file
        await ensureRepoExists();
        fs.appendFileSync(filePath, logContent);

        // Perform Git operations
        git.cwd(repoPath); // Set the working directory
        await git.addConfig("user.name", gitUserName);
        await git.addConfig("user.email", gitUserEmail);
        
        await git.add(".");

        // Explicitly set the author using the --author flag
        const author = `${gitUserName} <${gitUserEmail}>`;
        await git.commit(commitMessage, { "--author": author });

        console.log("Pushing to branch:", branchName);
        await git.push("origin", branchName);

        console.log("Git commit and push successful at", new Date().toISOString());
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

// Schedule automatic commits every 10 seconds
setInterval(() => {
    console.log("Running scheduled Git commit...");
    performGitCommit();
}, 10000); // 10000 milliseconds = 10 seconds

// Start the server
app.listen(process.env.PORT || 8000, () => {
    console.log("Server is running at http://localhost:8000");
});
