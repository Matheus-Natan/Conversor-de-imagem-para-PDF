const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now().toString() + "_" + file.originalname);
    }
})
const upload = multer({ storage: storage })
const filepix = require("filepix")
const fs = require("fs");
const { error } = require('console');


router.post('/upload', upload.single('img'), async function (req, res) {

    let fileName = req.file.filename;
    var newFileName = fileName.substring(0, fileName.length - 4)
    if (req.file) {

        await filepix.img2PDF(pages = './uploads', output = `./convert/${newFileName}.pdf`).catch(err => { console.log(err) });

        fs.unlink(`./uploads/${req.file.filename}`, (err) => {
            if (err) {
                console.log(err);
            }
        });

        res.json({ message: "Imagem Convertida" });
    } else {

        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Upload não realizado"
        })
    }

});

router.get("/download", (req, res) => {
    const arquivosSync = fs.readdirSync("./convert");

    const file = `./convert/${arquivosSync[0]}`;
    const readStream = fs.createReadStream(file);

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${arquivosSync[0]}`,
    });

    readStream.on("data", (chunk) => {
        res.write(chunk);
    });

    readStream.on("end", () => {
        res.end();
        fs.unlink(file, (err) => {
            if (err) {
                console.log(err);
            }
        });
    });

    readStream.on("error", (err) => {
        console.log(err);
        res.status(500).end();
    });
});

module.exports = router;