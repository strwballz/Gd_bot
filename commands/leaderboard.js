const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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

            const itemsPerPage = 15;
            const totalPages = Math.ceil(leaderboardData.length / itemsPerPage);
            let currentPage = 0;

            const generateEmbed = (page) => {
                const embedName = tipo.charAt(0).toUpperCase() + tipo.slice(1);
                const embed = new EmbedBuilder()
                    .setTitle(`🏆 Tabla de Clasificación: ${embedName}`)
                    .setColor(0xFFA500) // Color naranja/dorado
                    .setTimestamp()
                    .setFooter({ text: `Página ${page + 1} de ${totalPages} • Actualizado en tiempo real` });

                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const pageData = leaderboardData.slice(start, end);

                let description = '';
                pageData.forEach((user, index) => {
                    const globalIndex = start + index;
                    const medal = globalIndex === 0 ? '🥇' : globalIndex === 1 ? '🥈' : globalIndex === 2 ? '🥉' : `**${globalIndex + 1}.**`;
                    description += `${medal} **${user.userName}**: ${user.value.toLocaleString('en-US')}\n`;
                });

                if (description === '') {
                    description = 'No se encontraron datos para mostrar.';
                }

                embed.setDescription(description);
                return embed;
            };

            const generateButtons = (page) => {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev_page')
                        .setLabel('Anterior')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('next_page')
                        .setLabel('Siguiente')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page >= totalPages - 1)
                );
                return row;
            };

            const initialEmbed = generateEmbed(currentPage);
            
            // Si solo hay una página, no necesitamos botones
            if (totalPages <= 1) {
                return await interaction.editReply({ embeds: [initialEmbed], components: [] });
            }

            const initialRow = generateButtons(currentPage);
            const responseMessage = await interaction.editReply({
                embeds: [initialEmbed],
                components: [initialRow]
            });

            // Colector para manejar los clics en los botones (solo responde a quien ejecutó el comando original)
            const collector = responseMessage.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id,
                time: 60000 // Expira después de 60 segundos de inactividad
            });

            collector.on('collect', async i => {
                if (i.customId === 'prev_page') {
                    currentPage = Math.max(0, currentPage - 1);
                } else if (i.customId === 'next_page') {
                    currentPage = Math.min(totalPages - 1, currentPage + 1);
                }

                await i.update({
                    embeds: [generateEmbed(currentPage)],
                    components: [generateButtons(currentPage)]
                });
            });

            collector.on('end', async () => {
                // Deshabilitar los botones al finalizar el tiempo de inactividad
                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev_page')
                        .setLabel('Anterior')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('next_page')
                        .setLabel('Siguiente')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true)
                );

                try {
                    await interaction.editReply({
                        components: [disabledRow]
                    });
                } catch (err) {
                    // Ignorar error si el mensaje fue borrado por el usuario
                }
            });

        } catch (error) {
            console.error('Error al generar leaderboard:', error);
            await interaction.editReply('❌ Ocurrió un error al cargar la tabla de clasificación. Revisa la consola para más detalles.');
        }
    },
};
