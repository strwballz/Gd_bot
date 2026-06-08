const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] El comando en ${filePath} no tiene las propiedades obligatorias "data" o "execute".`);
		}
	}
}

if (!process.env.CLIENT_TOKEN || !process.env.CLIENT_ID) {
	console.error('Error: CLIENT_TOKEN o CLIENT_ID no están definidos en el archivo .env');
	process.exit(1);
}

if (!process.env.CLIENT_TOKEN.includes('.')) {
	console.warn('\n======================================================================');
	console.warn('[ADVERTENCIA] Tu CLIENT_TOKEN no parece ser un token de Bot válido de Discord.');
	console.warn('Los tokens de Bot válidos de Discord usualmente tienen tres partes separadas por puntos (ej. MTIz...G1A2...c4D5).');
	console.warn('Asegúrate de copiar el "Token" desde la pestaña "Bot" en el Discord Developer Portal (https://discord.com/developers/applications).');
	console.warn('NO utilices el "Client Secret" de la pestaña "OAuth2".');
	console.warn('======================================================================\n');
}

const rest = new REST({ version: '10' }).setToken(process.env.CLIENT_TOKEN);

(async () => {
	try {
		console.log(`Iniciando la actualización de ${commands.length} comandos de barra (/).`);

		// Registramos los comandos de forma global
		const data = await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: commands },
		);

		console.log(`Se registraron exitosamente ${data.length} comandos de barra (/).`);
	} catch (error) {
		console.error('Error al registrar los comandos:', error);
	}
})();
