const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ayuda')
        .setDescription('Muestra la lista de comandos disponibles y cómo usarlos'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('📖 Guía de Comandos del Bot GD')
            .setDescription('Aquí tienes la lista completa de comandos disponibles en el bot, su descripción y cómo utilizarlos:')
            .setColor(0x3498DB) // Azul moderno
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                {
                    name: '🎮 `/vincular`',
                    value: 'Vincula tu perfil de Geometry Dash a la base de datos.\n**Uso:** `/vincular accountid:<tu_account_id> playerid:<tu_player_id>`\n**Ejemplo:** `/vincular accountid:12345 playerid:67890`',
                    inline: false
                },
                {
                    name: '🏆 `/leaderboard`',
                    value: 'Muestra la clasificación de los usuarios registrados ordenada de mayor a menor.\n**Uso:** `/leaderboard tipo:<categoría>`\n**Categorías disponibles:** `stars`, `demons`, `usercoins`, `moons`',
                    inline: false
                },
                {
                    name: '🗑️ `/delete_user`',
                    value: 'Elimina a un usuario registrado de la base de datos.\n**Uso:** `/delete_user`\n*🔒 Nota: Comando restringido para Moderadores/Administradores.*',
                    inline: false
                },
                {
                    name: '📡 `/ping`',
                    value: 'Comprueba la latencia del bot.\n**Uso:** `/ping`',
                    inline: false
                },
                {
                    name: '📖 `/ayuda`',
                    value: 'Muestra este panel de ayuda.\n**Uso:** `/ayuda`',
                    inline: false
                }
            )
            .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};