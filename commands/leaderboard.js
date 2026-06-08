const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Profile = require('../models/Profile');
const robtopapi = require('../robtopapi');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Muestra la tabla de clasificación de GD obteniendo datos en tiempo real.')
        .addStringOption(option => 
            option.setName('tipo')
                .setDescription('La categoría de la tabla de clasificación')
                .setRequired(true)
                .addChoices(
                    { name: 'Stars', value: 'stars' },
                    { name: 'Demons', value: 'demons' },
                    { name: 'UserCoins', value: 'usercoins' },
                    { name: 'Moons', value: 'moons' }
                )
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const tipo = interaction.options.getString('tipo');

        try {
            // Obtener todos los perfiles vinculados en la BD
            const profiles = await Profile.find({});

            if (!profiles || profiles.length === 0) {
                return await interaction.editReply('❌ No hay usuarios registrados en la base de datos. Usa `/vincular` primero.');
            }

            const leaderboardData = [];

            // Consultar a la API de RobTop por cada usuario
            for (const profile of profiles) {
                const userInfo = await robtopapi.getGJUserInfo20(profile.accountID);
                if (userInfo) {
                    let value = userInfo.get(tipo);
                    
                    // Si la categoría es demons, viene como una cadena de texto separada por comas
                    if (tipo === 'demons' && value) {
                        let totalDemons = 0;
                        value.split(',').forEach(part => {
                            totalDemons += parseInt(part) || 0;
                        });
                        value = totalDemons;
                    } else {
                        value = parseInt(value) || 0;
                    }

                    const userName = userInfo.get('userName') || 'Usuario Desconocido';
                    
                    leaderboardData.push({
                        userName: userName,
                        value: value
                    });
                }
            }

            // Ordenar la lista de mayor a menor según el valor de la estadística elegida
            leaderboardData.sort((a, b) => b.value - a.value);

            // Crear Embed para mostrar los resultados de forma elegante
            const embedName = tipo.charAt(0).toUpperCase() + tipo.slice(1);
            const embed = new EmbedBuilder()
                .setTitle(`🏆 Tabla de Clasificación: ${embedName}`)
                .setColor(0xFFA500) // Color naranja/dorado
                .setTimestamp()
                .setFooter({ text: 'Actualizado en tiempo real desde los servidores de GD' });

            let description = '';
            for (let i = 0; i < leaderboardData.length && i < 15; i++) {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
                description += `${medal} **${leaderboardData[i].userName}**: ${leaderboardData[i].value.toLocaleString('en-US')}\n`;
            }

            if (description === '') {
                description = 'No se encontraron datos para mostrar.';
            }

            embed.setDescription(description);

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error al generar leaderboard:', error);
            await interaction.editReply('❌ Ocurrió un error al cargar la tabla de clasificación. Revisa la consola para más detalles.');
        }
    },
};
