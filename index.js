
const express = require('express');


const app = express();
app.use(express.json());      

app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

app.get('/api/status', (req, res) => {
  res.json({
    ok: true,
    message: 'Backend operativo',
    timestamp: new Date().toISOString(),
  });
});


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
