# 🏆 Geometry Dash Discord Bot

Un bot de Discord moderno diseñado para vincular perfiles de **Geometry Dash** con cuentas de Discord y mostrar clasificaciones en tiempo real basadas en las estadísticas de los jugadores en los servidores de RobTop.

---

## ✨ Características principales

* **🔗 Vinculación de cuentas (`/vincular`)**: Vincula tu cuenta de Discord con tu perfil de Geometry Dash usando tu `Account ID` y `Player ID`. El bot consulta la API pública de RobTop para validar que la cuenta existe.
* **🏆 Tablas de clasificación (`/leaderboard`)**: Genera rankings competitivos ordenados de mayor a menor y los muestra en elegantes embeds de Discord. Las estadísticas se obtienen en tiempo real.
  * **Categorías soportadas**: 
    * ⭐ **Stars** (Estrellas)
    * 😈 **Demons** (Demonios)
    * 🪙 **UserCoins** (Monedas de usuario)
    * 🌙 **Moons** (Lunas)
* **💾 Base de datos robusta**: Almacena las vinculaciones de forma persistente utilizando **MongoDB** y **Mongoose**.

---

## 🛠️ Requisitos previos

Antes de comenzar, necesitarás tener instalado:

1. [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada).
2. Una base de datos [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) activa.
3. Una aplicación creada en el [Discord Developer Portal](https://discord.com/developers/applications) con los permisos de bot correspondientes.

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
Descarga el código o clona el repositorio en tu máquina local:
```bash
git clone https://github.com/strwballz/Gd_bot.git
cd Gd_bot
```

### 2. Instalar dependencias
Instala los paquetes necesarios del proyecto:
```bash
npm install
```

### 3. Configurar las variables de entorno
Crea un archivo `.env` en la raíz del proyecto (o edita el ya existente) y define los siguientes valores:

```env
CLIENT_ID=TU_CLIENT_ID_DE_DISCORD
CLIENT_TOKEN=TU_TOKEN_DE_BOT_DE_DISCORD
MONGO_URI=mongodb://usuario:contraseña@servidor:puerto/base_de_datos?opciones
```

> [!IMPORTANT]
> Si experimentas errores de DNS (`ECONNREFUSED` o `querySrv` en Windows) usando la URI de tipo `mongodb+srv://`, utiliza la URI directa `mongodb://` que contiene los shards de conexión explícitos con el parámetro `replicaSet` correcto de tu cluster de MongoDB Atlas.

### 4. Registrar los comandos en Discord
Para que los comandos de barra (`/`) aparezcan en tus servidores de Discord, ejecuta el script de registro:
```bash
node deploy-commands.js
```

---

## 🎯 Uso de los Comandos

Una vez que el bot esté en tu servidor, podrás interactuar con él mediante los siguientes comandos:

| Comando | Parámetros | Descripción |
| :--- | :--- | :--- |
| `/vincular` | `accountid` *(Obligatorio)*, `playerid` *(Obligatorio)* | Vincula (o actualiza) tu cuenta de Discord con tus IDs de Geometry Dash. |
| `/leaderboard` | `tipo` *(Obligatorio: Stars, Demons, UserCoins o Moons)* | Muestra la clasificación del servidor para la categoría elegida, actualizada al momento. |
| `/ping` | Ninguno | Comando básico de prueba para verificar la latencia del bot. |

---

## 📂 Estructura del Proyecto

```text
Gd_bot/
├── commands/           # Definición de los comandos slash (/)
│   ├── leaderboard.js  # Lógica del ranking y obtención de estadísticas
│   ├── ping.js         # Comando de latencia básica
│   └── register.js     # Lógica de vinculación e inserción a la DB
├── events/             # Manejadores de eventos de Discord
│   ├── interactionCreate.js # Ejecución de comandos interactivos
│   └── ready.js             # Evento de inicio del bot
├── models/             # Esquemas de la base de datos (Mongoose)
│   └── Profile.js      # Modelo de perfil de usuario (userId, accountID, playerID)
├── .env                # Variables de entorno secretas (no se sube a Git)
├── deploy-commands.js  # Script para registrar comandos de barra en Discord
├── index.js            # Punto de entrada principal de la aplicación
├── robtopapi.js        # Módulo de integración con la API de RobTop (Geometry Dash)
└── package.json        # Dependencias y scripts de Node.js
```

---

## 🛡️ Licencia

Este proyecto está bajo la licencia **ISC**.
