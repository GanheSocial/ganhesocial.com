require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Configuração de CORS: Permitir origens que seguem o padrão "backend-cadastro-<qualquer_sufixo>-renissons-projects.vercel.app"
const corsOptions = {
  origin: /https:\/\/backend-cadastro-[a-z0-9]+-renissons-projects\.vercel\.app/,
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type',
  preflightContinue: false,
  optionsSuccessStatus: 200, // Para algumas versões antigas do navegador
};

// Middleware de CORS
app.use(cors(corsOptions)); // Aplica a configuração de CORS a todas as rotas

// Resposta explícita para requisições OPTIONS (Preflight)
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');  // Ou especifique sua origem
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

app.use(bodyParser.json());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 Conectado ao MongoDB!"))
  .catch(err => console.error("Erro ao conectar:", err));

// Criar um modelo para usuários
const UserSchema = new mongoose.Schema({
  nome: String,
  email: String,
  senha: String
});
const User = mongoose.model('User', UserSchema);

// Rota para cadastro
app.post('/api/cadastrar', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const novoUsuario = new User({ nome, email, senha });
    await novoUsuario.save();
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
