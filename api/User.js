import mongoose from "mongoose";

// 🔹 Schema para Contas Vinculadas
const ContaSchema = new mongoose.Schema({
  nomeConta: { type: String, required: true },
  id_tiktok: { type: String },
});

// 🔹 Schema para Histórico de Ações
const ActionHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // removido required
  token: { type: String },                                     // removido required
  nome_usuario: { type: String },                              // removido required
  id_pedido: { type: String },                                 // removido required
  id_conta: { type: String },                                  // removido required
  url_dir: { type: String },                                   // ✅ agora é opcional
  acao_validada: { type: Boolean, default: null },
  valor_confirmacao: { type: Number, default: 0 },
  quantidade_pontos: { type: Number },                         // removido required
  tipo_acao: { type: String },                                 // removido required
  data: { type: Date, default: Date.now },
  rede_social: { type: String, default: "TikTok" },
  tipo: { type: String, default: "Seguir" }
});

// 🔹 Schema para Histórico de Saques
const WithdrawSchema = new mongoose.Schema({
  valor: { type: Number, required: true },
  chave_pix: { type: String, required: true },
  tipo_chave: { type: String, default: "cpf" }
}, {
  timestamps: { createdAt: "data", updatedAt: "updatedAt" }
});

// 🔹 Schema de Ganhos por Dia
const GanhosPorDiaSchema = new mongoose.Schema({
  data: { type: String }, // tipo string ok se formato for "YYYY-MM-DD"
  valor: { type: Number, default: 0 }
}, { _id: false }); // evita criar _id interno para cada entrada do array

// 🔹 Schema do Usuário
const UserSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  nome_usuario: { type: String },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  token: { type: String, required: true },
  saldo: { type: Number, default: 0 },
  pix_key:      { type: String, default: null },
  pix_key_type: { type: String, default: null },
  contas: [ContaSchema],
  historico_acoes: [{ type: mongoose.Schema.Types.ObjectId, ref: "ActionHistory" }],
  saques: [WithdrawSchema],
  ganhosPorDia: [GanhosPorDiaSchema]
});

// 🔹 Schema para Verificação Global
const VerificacaoGlobalSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: "verificacao_global"
  },
  ultimaVerificacao: {
    type: Date,
    required: true
  }
});

// 🔹 Exportação dos modelos
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const ActionHistory = mongoose.models.ActionHistory || mongoose.model("ActionHistory", ActionHistorySchema);
const VerificacaoGlobal = mongoose.models.VerificacaoGlobal || mongoose.model("VerificacaoGlobal", VerificacaoGlobalSchema);

export { User, ActionHistory, VerificacaoGlobal };
