import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    throw new Error("❌ MONGO_URI não foi definida no ambiente!");
}

let isConnected = false; // 🚀 Flag para evitar múltiplas conexões

const connectDB = async () => {
    if (isConnected) {
        console.log("✅ Já conectado ao MongoDB!");
        return;
    }

    try {
        const db = await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            bufferCommands: false, // 🔹 Garante que os comandos não sejam armazenados antes da conexão
        });

        isConnected = db.connections[0].readyState === 1; // ✅ Verifica conexão ativa
        console.log("🟢 Conectado ao MongoDB!");
    } catch (error) {
        console.error("❌ Erro ao conectar ao MongoDB:", error);
        throw new Error("Erro ao conectar ao banco de dados");
    }
};

export default connectDB;
