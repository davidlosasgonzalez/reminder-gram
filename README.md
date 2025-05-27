# 🧰 ReminderGram (Telegram + LLM + Google Calendar)

**ReminderGram** es un asistente inteligente para Telegram que te permite gestionar Google Calendar usando lenguaje natural en español (texto o voz), impulsado por OpenAI y con integración directa OAuth a Google.

## 🚀 Funcionalidades principales

- Consulta tus próximos eventos en Google Calendar.
- Crea nuevos eventos en la agenda con lenguaje natural en español.
- Soporta eventos de día completo y con hora concreta.
- Entiende fechas relativas (“hoy”, “mañana”, “el lunes”) y horarios flexibles.
- Ignora automáticamente peticiones fuera del dominio calendario.

## ⚙️ Guía paso a paso para empezar

### 1. Clona e instala dependencias

```bash
git clone <repo-url>
cd reminder-gram
npm install
```

### 2. Configura entorno y credenciales

- **Telegram:** Crea un bot con [@BotFather](https://t.me/BotFather) y obtén tu token.

- **Google Calendar:**

    - Activa Google Calendar API en [Google Cloud Console](https://console.cloud.google.com/).
    - Descarga el archivo de credenciales desde Google Cloud (normalmente llamado `client_secret_XXX.json` o similar), **renómbralo a `credentials.json`** para mayor claridad y colócalo en `/private`.

- **Ejemplo de `.env` recomendado:**

```env
# Telegram Bot Settings
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_CHAT_ID=

# OpenAI / LLM Settings
OPENAI_API_KEY=
LLM_MODEL=gpt-4o

# App Settings
CRON_TIME=08:00

# Google Calendar Integration
GOOGLE_OAUTH_USER_EMAIL=
GOOGLE_CALENDAR_ID=
CREDENTIALS_PATH=private/credentials.json

# Event Filtering
IGNORED_EVENT_TITLES=festivo,holiday
```

- Añade `.env` y `/private/` a tu `.gitignore`.

### 3. Autoriza Google Calendar

Puedes realizar este paso tantas veces como desees, una por cada cuenta de Gmail que quieras vincular (por ejemplo, para poder consultar eventos de varios calendarios principales). Recuerda que actualmente **solo se listan los eventos de los calendarios principales** de cada cuenta vinculada.

> **Nota:** Solo podrás **crear y borrar** eventos en un calendario concreto: el que definas en la variable `GOOGLE_CALENDAR_ID` de tu `.env` (por defecto `primary`). Los demás solo son de consulta; _no es posible modificar eventos ya existentes_.

Para vincular una cuenta ejecuta:

```bash
node scripts/generate-calendar-token.ts
```

Pasos completos:

- Al ejecutar el comando, el sistema te pedirá el **email**. Debes introducir **exactamente el correo de Gmail** que vayas a vincular. ¡No hay comprobación automática! Si te equivocas, el token no será válido, así que verifica que escribes bien el email.
- Accede al enlace que aparecerá en la consola (Google te pedirá autorizar la app).
- Autoriza el acceso de la cuenta Google.
- Tras autorizar, serás redirigido a una URL local (localhost) en tu navegador. **Copia la URL completa que aparece en la barra de direcciones.**
- Pega esa URL en la terminal y pulsa enter.
- ¡Listo! El token de Google se habrá generado y guardado en `/private/tokens`.

### 4. Arranca el bot

```bash
npm run start:dev
```

O para producción:

```bash
npm run build
npm run start:prod
```

### 5. Usa el bot

Simplemente **chatea con el bot en Telegram**. No requiere comandos.

- **Consulta tu agenda:**

    - `¿Qué tengo esta semana?`
    - `¿Tengo algo mañana?`

- **Crea eventos:**

    - `Reunión con Pedro mañana a las 9:00`
    - `Cita médica el lunes a las 10:00`
    - `Vacaciones todo el día el viernes`

El bot interpretará tu mensaje, extraerá la intención y los datos necesarios, y actuará en Google Calendar según corresponda.

## 🧪 Tests

```bash
npm run test
```

## 🛡️ Seguridad y buenas prácticas

- **Nunca subas** tu `credentials.json`, tokens OAuth o `.env` a ningún repo público.
- Haz backup regular de `credentials.json` y tokens de Google.
- Rota tus claves y secretos según política de seguridad.
- El bot es modular: puedes añadir más integraciones o LLMs fácilmente siguiendo la arquitectura de servicios.

## 📄 Licencia

Este proyecto está bajo licencia MIT.
