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

// Carregar dados
function loadData() {
    if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE));
    }
    return { count: 0 };
}

// Salvar dados
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let data = loadData();

client.once('ready', () => {
    console.log(`Bot online como ${client.user.tag}`);
});

// Monitorar entrada em call
client.on('voiceStateUpdate', (oldState, newState) => {
    const member = newState.member;

    if (member.id !== TARGET_USER_ID) return;

    // Entrou em call
    if (!oldState.channelId && newState.channelId) {
        data.count++;
        saveData(data);

        console.log(`${member.user.username} entrou na call! Total: ${data.count}`);
    }
});

// Comando !sumido
client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.content === '!sumido') {
        message.reply(`O estudado do luan entrou na call ${data.count} vezes.`);
    }
});

client.login(TOKEN);