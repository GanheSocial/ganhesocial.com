import connectDB from './db.js';
import { Pedido } from "./schema.js";
import mongoose from 'mongoose';

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { authorization } = req.headers;
    const token = authorization?.split(" ")[1];

    if (!token || token !== process.env.SMM_API_KEY) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    await connectDB();

    const {
      tipo_acao,
      nome_usuario,
      quantidade_pontos,
      url_dir,
      id_pedido,
      quantidade,
      valor
    } = req.body;

    if (
      !tipo_acao ||
      !nome_usuario ||
      quantidade_pontos === undefined ||
      !url_dir ||
      !id_pedido ||
      quantidade === undefined ||
      valor === undefined
    ) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    const pontos = parseFloat(quantidade_pontos);
    const qtd = parseInt(quantidade);
    const val = parseFloat(valor);

    if (isNaN(pontos) || pontos <= 0) {
      return res.status(400).json({ error: "Quantidade de pontos inválida" });
    }
    if (isNaN(qtd) || qtd <= 0) {
      return res.status(400).json({ error: "Quantidade inválida" });
    }
    if (isNaN(val) || val <= 0) {
      return res.status(400).json({ error: "Valor inválido" });
    }

// Gera um número aleatório de 9 dígitos
function gerarIdPedido() {
  return Math.floor(100000000 + Math.random() * 900000000);
}   

// Usa o id_pedido se for um número válido, senão gera um novo
let pedidoId;
if (id_pedido && /^\d{9}$/.test(id_pedido)) {
  pedidoId = parseInt(id_pedido);
} else {
  pedidoId = gerarIdPedido();
}

// Verifica se já existe
const pedidoExistente = await Pedido.findById(pedidoId);

if (!pedidoExistente) {
  const novoPedido = new Pedido({
    _id: pedidoId,
    rede: "tiktok",
    tipo: tipo_acao.toLowerCase() === "seguir" ? "seguidores" : tipo_acao.toLowerCase(),
    nome: `Ação ${tipo_acao} - ${nome_usuario}`,
    valor: val,
    quantidade: qtd,
    link: url_dir,
    status: "pendente",
    dataCriacao: new Date(),
  });

  await novoPedido.save();
}

    console.log("✅ Nova ação registrada:", { tipo_acao, nome_usuario, id_pedido, pontos });

    return res.status(201).json({ message: "Ação adicionada com sucesso" });

  } catch (error) {
    console.error("❌ Erro ao adicionar ação:", {
      message: error.message,
      stack: error.stack,
      detalhes: error
    });
    return res.status(500).json({ error: "Erro interno ao adicionar ação" });
  }
};

export default handler;
