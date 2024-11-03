const express = require('express');
const { uploadCSV, exportCSV } = require('../controllers/csvController');
const router = express.Router();
const multer = require('multer');

// Configuración de Multer para almacenar los archivos en la carpeta temporal 'tmp'
const upload = multer({ dest: 'tmp/' });

// Ruta para subir el archivo CSV
router.post('/upload-csv', upload.single('file'), uploadCSV);

// Ruta para exportar datos a CSV
router.get('/export-csv', exportCSV);

module.exports = router;

