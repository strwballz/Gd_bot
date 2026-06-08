const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const Profile = require('../models/Profile');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete_user')
        .setDescription('Elimina a un usuario registrado de la lista de Geometry Dash')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        // Verificar permisos en tiempo de ejecución
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return await interaction.reply({
                content: '❌ No tienes permisos de moderador para ejecutar este comando.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            // Obtener todos los perfiles de la base de datos
            const profiles = await Profile.find({});

            if (!profiles || profiles.length === 0) {
                return await interaction.editReply('❌ No hay ningún usuario registrado en la base de datos.');
            }

            const itemsPerPage = 15;
            const totalPages = Math.ceil(profiles.length / itemsPerPage);
            let currentPage = 0;

            const generateEmbed = (page) => {
                const embed = new EmbedBuilder()
                    .setTitle('🗑️ Eliminar Usuario de la Lista')
                    .setDescription('Selecciona un usuario del menú desplegable de abajo para eliminarlo de la lista.')
                    .setColor(0xFF0000)
                    .setFooter({ text: `Página ${page + 1} de ${totalPages} • Total: ${profiles.length} usuarios` });

                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const pageData = profiles.slice(start, end);

                let list = '';
                pageData.forEach((profile, index) => {
                    const globalIndex = start + index;
                    const name = profile.userName || `AccountID: ${profile.accountID}`;
                    list += `**${globalIndex + 1}.** ${name} (Discord: <@${profile.userId}>)\n`;
                });

                embed.addFields({ name: 'Usuarios Registrados', value: list || 'No hay usuarios en esta página.' });
                return embed;
            };

            const generateComponents = (page) => {
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const pageData = profiles.slice(start, end);

                // Crear el menú de selección (Select Menu)
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('delete_select')
                    .setPlaceholder('Selecciona un usuario de GD para eliminar...')
                    .addOptions(
                        pageData.map((profile) => ({
                            label: profile.userName || `ID: ${profile.accountID}`,
                            description: `Discord ID: ${profile.userId}`,
                            value: profile.accountID // Usamos accountID como valor único
                        }))
                    );

                const selectRow = new ActionRowBuilder().addComponents(selectMenu);

                // Crear los botones de navegación
                const buttonsRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev_delete_page')
                        .setLabel('Anterior')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('next_delete_page')
                        .setLabel('Siguiente')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page >= totalPages - 1)
                );

                return totalPages > 1 ? [selectRow, buttonsRow] : [selectRow];
            };

            const responseMessage = await interaction.editReply({
                embeds: [generateEmbed(currentPage)],
                components: generateComponents(currentPage)
            });

            // Crear el colector de componentes interactivos
            const collector = responseMessage.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id,
                time: 120000 // 2 minutos de inactividad
            });

            collector.on('collect', async i => {
                if (i.customId === 'prev_delete_page') {
                    currentPage = Math.max(0, currentPage - 1);
                    await i.update({
                        embeds: [generateEmbed(currentPage)],
                        components: generateComponents(currentPage)
                    });
                } else if (i.customId === 'next_delete_page') {
                    currentPage = Math.min(totalPages - 1, currentPage + 1);
                    await i.update({
                        embeds: [generateEmbed(currentPage)],
                        components: generateComponents(currentPage)
                    });
                } else if (i.customId === 'delete_select') {
                    const selectedAccountID = i.values[0];

                    try {
                        const deleted = await Profile.findOneAndDelete({ accountID: selectedAccountID });
                        collector.stop('deleted');

                        if (deleted) {
                            const name = deleted.userName || `ID: ${deleted.accountID}`;
                            await i.update({
                                content: `✅ El usuario **${name}** (Discord: <@${deleted.userId}>) ha sido eliminado correctamente de la base de datos.`,
                                embeds: [],
                                components: []
                            });
                        } else {
                            await i.update({
                                content: '❌ No se pudo encontrar al usuario en la base de datos para eliminarlo.',
                                embeds: [],
                                components: []
                            });
                        }
                    } catch (error) {
                        console.error('Error al borrar usuario:', error);
                        await i.update({
                            content: '❌ Ocurrió un error al intentar eliminar al usuario de la base de datos.',
                            embeds: [],
                            components: []
                        });
                    }
                }
            });

            collector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    // Si expira el tiempo sin acción, deshabilitamos/limpiamos todo
                    try {
                        await interaction.editReply({
                            content: '⏳ Tiempo de espera agotado. El comando ha expirado.',
                            embeds: [],
                            components: []
                        });
                    } catch (e) { }
                }
            });

        } catch (error) {
            console.error('Error en delete_user.js:', error);
            await interaction.editReply('❌ Ocurrió un error al cargar la lista de usuarios.');
        }
    }
};
