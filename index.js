const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

const app = express();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024
    }
});

app.use(express.static(path.join(__dirname, "public")));

app.post("/generate", upload.single("file"), (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "File tidak ditemukan"
            });
        }

        const ext =
            path.extname(req.file.originalname);

        if (ext !== ".js") {
            return res.status(400).json({
                success: false,
                message: "Hanya file .js"
            });
        }

        const hash =
            crypto
                .createHash("sha256")
                .update(req.file.buffer)
                .digest("hex");

        const Result =
`"${hash}";`;

        res.json({
            success: true,
            filename: req.file.originalname,
            hash,
            Result
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

const PORT =
    process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Running on " + PORT);
});