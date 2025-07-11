const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'bbeabba';
const REPO = 'mapa-nuestros-recuerdos';
const FILE_PATH = 'recuerdos.json';

// Obtener contenido actual
app.get('/recuerdos', async (req, res) => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3.raw'
      }
    });
    res.json(JSON.parse(response.data));
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'No se pudo cargar recuerdos' });
  }
});

// Guardar nuevo contenido
app.post('/recuerdos', async (req, res) => {
  const nuevosDatos = req.body;

  try {
    // Obtener SHA del archivo actual
    const getFile = await axios.get(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`
      }
    });

    const sha = getFile.data.sha;

    await axios.put(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
      message: 'Actualizar recuerdos.json',
      content: Buffer.from(JSON.stringify(nuevosDatos, null, 2)).toString('base64'),
      sha
    }, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`
      }
    });

    res.json({ mensaje: 'Recuerdos actualizados correctamente' });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'No se pudo guardar recuerdos' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
