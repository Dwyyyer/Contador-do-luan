const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const TOKEN = process.env.TOKEN;
const TARGET_USER_ID = process.env.USER_ID; // ID do amigo
const DATA_FILE = './contador.json';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Carregar dados com proteção
function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const rawData = fs.readFileSync(DATA_FILE, 'utf8').trim();

            if (!rawData) {
                return { count: 0, lastJoinDate: "" };
            }

            return JSON.parse(rawData);
        }
    } catch (error) {
        console.error("Erro ao carregar contador.json:", error);
    }

    return { count: 0, lastJoinDate: "" };
}

// Salvar dados
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Criar arquivo se não existir
if (!fs.existsSync(DATA_FILE)) {
    saveData({ count: 0, lastJoinDate: "" });
}

let data = loadData();

client.once('ready', () => {
    console.log(`Bot online como ${client.user.tag}`);
});

// Monitorar entrada em call
client.on('voiceStateUpdate', async (oldState, newState) => {
    const member = newState.member;

    if (!member || member.id !== TARGET_USER_ID) return;

    // Entrou em call
    if (!oldState.channelId && newState.channelId) {
        const today = new Date().toLocaleDateString('pt-BR');

        // Conta apenas uma vez por dia
        if (data.lastJoinDate !== today) {
            data.count++;
            data.lastJoinDate = today;

            saveData(data);

            console.log(`${member.user.username} apareceu hoje! Total de dias: ${data.count}`);

        } else {
            console.log(`${member.user.username} já foi contado hoje.`);
        }
    }
});

// Comando !sumido
client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.content === '!sumido') {
        message.reply(
            `📊 O estudado do Luan apareceu em call ${data.count} dias diferentes.`
        );
    }
});

client.login(TOKEN);