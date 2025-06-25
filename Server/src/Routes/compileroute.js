const express = require("express");
const { executeCode } = require("../Controller/compilercontroller");

const router = express.Router();
router.post("/execute", executeCode);

module.exports = router;
