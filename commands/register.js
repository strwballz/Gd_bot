const { SlashCommandBuilder } = require('discord.js');
const robtopapi = require('../robtopapi');
const Profile = require('../models/Profile');

async function execute(interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });

        const accountID = interaction.options.getString('accountid');
        const playerID = interaction.options.getString('playerid');

        // Consultar la API de RobTop para verificar que el accountID exista
        const userInfo = await robtopapi.getGJUserInfo20(accountID);
        
        if (!userInfo) {
            return await interaction.editReply('❌ No se encontró ningún usuario de Geometry Dash con ese Account ID o hubo un error con los servidores de RobTop.');
        }

        // Extraer nombre de usuario para confirmar
        const userName = userInfo.get('userName') || userInfo.get('1') || 'Jugador Encontrado';

        // Buscar si el perfil de GD ya está vinculado
        const existingProfile = await Profile.findOne({ accountID: accountID });

        if (existingProfile) {
            // Actualizar
            existingProfile.userId = interaction.user.id;
            existingProfile.playerID = playerID;
            existingProfile.userName = userName;
            await existingProfile.save();
            return await interaction.editReply(`✅ El perfil ha sido actualizado. Ahora estás vinculado a **${userName}**.`);
        } else {
            // Eliminar el índice único antiguo si existe para evitar errores (ignora si no existe)
            try { await Profile.collection.dropIndex('userId_1'); } catch(e) {}
            
            // Crear nuevo
            const newProfile = new Profile({
                userId: interaction.user.id,
                accountID: accountID,
                playerID: playerID,
                userName: userName
            });
            await newProfile.save();
            return await interaction.editReply(`✅ ¡Tu perfil de GD ha sido añadido con éxito a la leaderboard como **${userName}**!`);
        }
    } catch (error) {
        console.error('Error en register.js:', error);
        await interaction.editReply('❌ Ocurrió un error al intentar vincular tu cuenta. Por favor, asegúrate de que la conexión a la base de datos es correcta.');
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vincular')
        .setDescription('Vincula tu perfil de GD proporcionando tu Account ID y Player ID')
        .addStringOption(option => 
            option.setName('accountid')
                .setDescription('Tu Account ID de Geometry Dash')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('playerid')
                .setDescription('Tu Player ID de Geometry Dash')
                .setRequired(true)),
    execute,
};
