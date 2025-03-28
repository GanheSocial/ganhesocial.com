import axios from "axios";
import connectDB from "./db.js";
import User from "./User.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido." });
    }

    // Conectar ao banco de dados
    await connectDB();

    // Obter os parâmetros do corpo da requisição
    const { token, nome_usuario, id_pedido } = req.body;

    if (!token || !nome_usuario || !id_pedido) {
        return res.status(400).json({ error: "Os parâmetros 'token', 'nome_usuario' e 'id_pedido' são obrigatórios." });
    }

    try {
        // Buscar usuário pelo token fixo salvo no MongoDB
        const usuario = await User.findOne({ token });

        if (!usuario) {
            return res.status(403).json({ error: "Acesso negado. Token inválido." });
        }

        // 🔹 Chamar a API bind_tk para obter o ID da conta
        const bindTkUrl = `http://api.ganharnoinsta.com/bind_tk.php?token=afc012ec-a318-433d-b3c0-5bf07cd29430&sha1=e5990261605cd152f26c7919192d4cd6f6e22227&nome_usuario=${nome_usuario}`;
        const bindResponse = await axios.get(bindTkUrl);
        const bindData = bindResponse.data;

        if (bindData.status !== "success" || !bindData.id_conta) {
            return res.status(400).json({ error: "Erro ao obter ID da conta." });
        }

        const { id_conta, id_tiktok, s } = bindData;

        // 🔹 Se a API bind_tk retornar sucesso, chamar a API user/info
        let userInfo = null;
        try {
            const userInfoResponse = await axios.get("https://tiktok-scraper7.p.rapidapi.com/user/info", {
                params: { unique_id: nome_usuario },
                headers: {
                    'x-rapidapi-key': 'f3dbe81fe5msh5f7554a137e41f1p11dce0jsnabd433c62319',
                    'x-rapidapi-host': 'tiktok-scraper7.p.rapidapi.com'
                }
            });
            userInfo = userInfoResponse.data;
        } catch (error) {
            console.error("Erro ao chamar a API user/info:", error);
        }

        // 🔹 Chamar a API confirm_action para confirmar a ação
        const url = "https://api.ganharnoinsta.com/confirm_action.php";
        const params = new URLSearchParams({
            token: "afc012ec-a318-433d-b3c0-5bf07cd29430",
            sha1: "e5990261605cd152f26c7919192d4cd6f6e22227",
            id_conta,
            id_pedido,
            is_tiktok: "1",
        });

        const confirmResponse = await axios.post(url, params);
        const confirmData = confirmResponse.data;

        if (confirmData.status !== "success") {
            return res.status(400).json({ error: "Erro ao confirmar ação." });
        }

        return res.status(200).json({
            message: "Ação confirmada com sucesso!",
            detalhes: confirmData,
            userInfo: userInfo || "Nenhuma informação de usuário disponível"
        });

    } catch (error) {
        console.error("Erro ao processar requisição:", error);
        return res.status(500).json({ error: "Erro interno ao processar requisição." });
    }
}
