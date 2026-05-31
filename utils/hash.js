const crypto = require("crypto");

function generateHash(content) {
    return crypto
        .createHash("sha256")
        .update(content)
        .digest("hex");
}

module.exports = generateHash;