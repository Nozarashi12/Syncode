const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const executeCode = async (req, res) => {
    const { language, code, input } = req.body;

    if (!language || !code) {
        return res.status(400).json({ error: "Language and code are required" });
    }

    // Check if the code requires input
    if (requiresInput(code, language) && !input) {
        return res.status(400).json({ error:"Input was not provided" });
    }

    try {
        const fileId = uuid();
        let fileExtension, fileName, filePath;

        // Set file extension based on language
        if (language === "python") fileExtension = "py";
        else if (language === "cpp") fileExtension = "cpp";
        else if (language === "java") fileExtension = "java";
        else fileExtension = "js"; 

        fileName = `Temp_${fileId}.${fileExtension}`;
        filePath = path.join("temp", fileName);

        // Ensure temp directory exists
        if (!fs.existsSync("temp")) fs.mkdirSync("temp");

        // Write the code to a temporary file
        fs.writeFileSync(filePath, code);

        let command, args = [];

        if (language === "python") {
            command = "python";
            args = [filePath];
        } 
        else if (language === "cpp") {
            const outputFilePath = `${filePath}.out`;
            command = "g++";
            args = [filePath, "-o", outputFilePath];

            // Compile C++ code first
            const compile = spawn(command, args);
            compile.on("close", (compileCode) => {
                if (compileCode === 0) {
                    executeProcess(outputFilePath, [], input, res, filePath, outputFilePath);
                } else {
                    res.status(400).json({ error: "Compilation failed" });
                }
            });
            return;
        } 
        else if (language === "java") {
            // Java file name should match the class name inside
            const className = getJavaClassName(code);
            if (!className) return res.status(400).json({ error: "Invalid Java code: Missing class name." });

            const javaFilePath = path.join("temp", `${className}.java`);
            const classFilePath = path.join("temp", `${className}.class`);

            // Rename file to match class name
            fs.renameSync(filePath, javaFilePath);

            command = "javac";
            args = [javaFilePath];

            // Compile Java code
            const compile = spawn(command, args);
            compile.on("close", (compileCode) => {
                if (compileCode === 0) {
                    executeProcess("java", ["-cp", "temp", className], input, res, javaFilePath, classFilePath);
                } else {
                    res.status(400).json({ error: "Compilation failed" });
                }
            });
            return;
        } 
        else if (language === "javascript") {
            command = "node";
            args = [filePath];
        } 
        else {
            return res.status(400).json({ error: "Unsupported language" });
        }

        executeProcess(command, args, input, res, filePath);

    } catch (error) {
        res.status(500).json({ error: "Execution error", details: error.message });
    }
};

// Function to execute process and handle input/output
const executeProcess = (command, args, input, res, filePath, outputFilePath = null) => {
    const process = spawn(command, args, { shell: true });

    let output = "";

    // Provide user input to the process
    if (input) {
        process.stdin.write(input + "\n");
        process.stdin.end();
    }

    process.stdout.on("data", (data) => {
        output += data.toString();
    });

    process.stderr.on("data", (data) => {
        output += data.toString();
    });

    process.on("close", (code) => {
        fs.unlinkSync(filePath); // Clean up source file
        if (outputFilePath) fs.unlinkSync(outputFilePath); // Clean up compiled file (for C++/Java)
        res.json({ output, exitCode: code });
    });
};

// Extracts the Java class name from the code
const getJavaClassName = (code) => {
    const match = code.match(/public\s+class\s+(\w+)/);
    return match ? match[1] : null;
};

// Function to check if code requires user input
const requiresInput = (code, language) => {
    if (language === "python") {
        return /input\s*\(/.test(code);
    } else if (language === "cpp") {
        return /cin\s*>>/.test(code);
    } else if (language === "java") {
        return /Scanner\s*\w+\s*=\s*new\s*Scanner\s*\(/.test(code);
    } else if (language === "javascript") {
        return /prompt\s*\(/.test(code);
    }
    return false;
};

module.exports = { executeCode };
