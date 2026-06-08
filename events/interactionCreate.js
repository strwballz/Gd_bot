const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		// Solo manejamos comandos de barra (chat input commands)
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No se encontró el comando: ${interaction.commandName}`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(`Error al ejecutar el comando ${interaction.commandName}:`, error);
			const errorMsg = { content: '¡Hubo un error al ejecutar este comando!', ephemeral: true };
			
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(errorMsg);
			} else {
				await interaction.reply(errorMsg);
			}
		}
	},
};
