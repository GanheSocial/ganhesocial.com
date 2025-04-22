import axios from "axios";
import connectDB from "./db.js";
import { User } from "./User.js";
import { ActionHistory } from "./User.js";

// Função para reverter a ofuscação do id_action
function reverterIdAction(idAction) {
  return idAction
    .split('')
    .map(char => char === '0' ? '0' : String(parseInt(char) + 1))
    .join('');
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  await connectDB();

  const { token, id_action, id_tiktok } = req.body;
  if (!token || !id_action || !id_tiktok) {
    return res.status(400).json({ error: "Parâmetros obrigatórios ausentes." });
  }

  try {
    // Verifica o usuário com o token fornecido
    const usuario = await User.findOne({ token });
    if (!usuario) {
      return res.status(403).json({ error: "Acesso negado. Token inválido." });
    }

    // 🔹 Reverter o id_action para id_pedido
    const idPedidoOriginal = reverterIdAction(id_action);

    // 🔹 Preparar payload para API externa com id_pedido revertido
    const payload = {
      token: "a03f2bba-55a0-49c5-b4e1-28a6d1ae0876",
      sha1: "e5990261605cd152f26c7919192d4cd6f6e22227",
      id_conta: id_tiktok,
      id_pedido: idPedidoOriginal,  // Usando o id_pedido original
      is_tiktok: "1"
    };

    // 🔹 Chamar API externa com timeout de 5s
    let confirmData = {};
    try {
      const confirmResponse = await axios.post(
        "https://api.ganharnoinsta.com/confirm_action.php",
        payload,
        { timeout: 5000 }
      );
      confirmData = confirmResponse.data || {};
      console.log("Resposta da API confirmar ação:", confirmData);
    } catch (err) {
      console.error("Erro ao confirmar ação (externa):", err.response?.data || err.message);
      return res.status(502).json({ error: "Falha na confirmação externa." });
    }

    // 🔹 Salvar histórico da ação
    const acaoValida = confirmData.status === "success";
    const valorConfirmacao = parseFloat(confirmData.valor || 0);

    const newAction = new ActionHistory({
      token,
      nome_usuario: usuario.nome,
      tipo_acao: confirmData.tipo_acao || 'seguir',  // exemplo
      quantidade_pontos: valorConfirmacao,  // ou ajuste conforme lógica do seu sistema
      url_dir: confirmData.url || '',
      id_conta: id_tiktok,
      id_pedido: idPedidoOriginal,  // Usando o id_pedido original
      user: usuario._id,
      acao_validada: acaoValida,
      valor_confirmacao: valorConfirmacao,
      data: new Date()
    });

    const saved = await newAction.save();
    usuario.historico_acoes.push(saved._id);
    await usuario.save();

    // 🔹 Resposta final para o cliente
    return res.status(200).json({
      status: "sucesso",
      message: acaoValida
        ? "Ação confirmada e validada!"
        : "Ação confirmada, mas não validada.",
      acaoValida,
      valorConfirmacao,
      dadosExternos: confirmData
    });

  } catch (error) {
    console.error("Erro ao processar requisição:", error.message);
    return res.status(500).json({ error: "Erro interno ao processar requisição." });
  }
}
