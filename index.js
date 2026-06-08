const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
require('dotenv').config();

// Conexión a la base de datos MongoDB
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('✅ Conectado a la base de datos MongoDB.'))
        .catch(err => console.error('❌ Error al conectar a MongoDB:', err));
} else {
    console.log('⚠️ [WARNING] Falta la variable MONGO_URI. Omitiendo conexión a la BD.');
}

// Inicializamos el cliente de Discord con los Intents necesarios
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// Colección para almacenar los comandos
client.commands = new Collection();

// Cargador dinámico de Comandos
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] El comando en ${filePath} no tiene las propiedades "data" o "execute".`);
        }
    }
}

// Cargador dinámico de Eventos
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

// Iniciamos sesión en Discord con el token
if (!process.env.CLIENT_TOKEN) {
    console.error('Error: CLIENT_TOKEN no está definido en el archivo .env');
    process.exit(1);
}

if (!process.env.CLIENT_TOKEN.includes('.')) {
    console.warn('\n======================================================================');
    console.warn('[ADVERTENCIA] Tu CLIENT_TOKEN no parece ser un token de Bot válido.');
    console.warn('Por favor, asegúrate de haber copiado el "Token" de la pestaña "Bot"');
    console.warn('en el portal de desarrolladores de Discord, y no el "Client Secret".');
    console.warn('======================================================================\n');
}

client.login(process.env.CLIENT_TOKEN);
