const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Create a temporary directory for storing code files
const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

const execute = (language, code, input, callback) => {
    const jobId = uuidv4(); // Unique ID for each execution
    let filePath, command, args;



    // Check if the code requires input and if input is missing
    const requiresInput = (language === "python" && code.includes("input(")) || 
                          (language === "cpp" && code.includes("cin"));

    if (requiresInput && (!input || input.trim() === "")) {
        return callback({ output: "", error: "Error: Input required but not provided", exitCode: 1 });
    }

    if (language === "python") {
        filePath = path.join(tempDir, `${jobId}.py`);
        fs.writeFileSync(filePath, code);
        command = "python3";
        args = [filePath];
    } else if (language === "cpp") {
        filePath = path.join(tempDir, `${jobId}.cpp`);
        const execFile = path.join(tempDir, `${jobId}.out`);

        fs.writeFileSync(filePath, code);

        // Compile the C++ code
        const compile = spawn("g++", [filePath, "-o", execFile]);
        let compileError = "";

        compile.stderr.on("data", (data) => {
            compileError += data.toString();
        });

        compile.on("close", (compileCode) => {
            if (compileCode !== 0) {
                return callback({ output: "", error: `Compilation Error: ${compileError}`, exitCode: compileCode });
            }
            runProcess(execFile, input, callback);
        });

        return;
    } else {
        return callback({ output: "", error: "Unsupported Language", exitCode: 1 });
    }

    runProcess(command, input, callback, args, filePath);
};

const runProcess = (command, input, callback, args = [], filePath = null) => {
    const process = spawn(command, args, { stdio: ["pipe", "pipe", "pipe"] });
    let output = "", error = "";
    let timeoutId;

    process.stdin.write(input);
    process.stdin.end();

    process.stdout.on("data", (data) => output += data.toString());
    process.stderr.on("data", (data) => error += data.toString());

    process.on("close", (exitCode) => {
        clearTimeout(timeoutId); // Clear timeout on successful execution
        callback({ output: output.trim(), error: error.trim(), exitCode });

        // Cleanup temp files after execution
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    // Hard timeout to prevent infinite loops
    timeoutId = setTimeout(() => {
        process.kill(); // Terminate the process
        callback({ output: "", error: "Execution Timeout: Code took too long to execute", exitCode: 1 });

        // Cleanup temp file
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }, 3000);
};

module.exports = { execute };
