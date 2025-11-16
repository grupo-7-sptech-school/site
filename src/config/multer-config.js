const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const nome = Date.now() + ext;
        cb(null, nome);
    }
});

// EXTENSÕES PERMITIDAS
const extensoesPermitidas = [".png", ".jpg", ".jpeg"];

// FILTRO DE ARQUIVOS
function fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!extensoesPermitidas.includes(ext)) {
        return cb(new Error("Somente arquivos PNG, JPG ou JPEG são permitidos!"), false);
    }

    cb(null, true);
}

const upload = multer({
    storage,
    fileFilter
});

module.exports = upload;
