
# 🧰 AI Secretary Bot (Telegram + LLM + Google Calendar)

Este proyecto es un asistente personal inteligente para Telegram, capaz de **gestionar tu agenda** y crear o consultar eventos en Google Calendar con entrada natural (texto o voz), todo en español.

## 🚀 Funcionalidad actual

* **Consultar tus próximos eventos en Google Calendar**.
* **Crear nuevos eventos en tu agenda** usando lenguaje natural.
* Soporte para eventos de **todo el día** o con hora específica.
* Entiende fechas relativas (“hoy”, “mañana”, “el lunes”) y horas en formato natural.
* Rechaza automáticamente peticiones fuera del dominio calendario (no puede modificar, borrar, ni gestionar tareas).

## 🏗️ Estructura del proyecto

```
reminder-gram/
│   .env
│   .gitignore
│   .prettierrc
│   eslint.config.mjs
│   nest-cli.json
│   package-lock.json
│   package.json
│   README.md
│   session_db.json
│   tsconfig.build.json
│   tsconfig.json
│
├───private
│       client_secret.json
│
├───src
│   │   app.module.ts
│   │   main.ts
│   │
│   ├───application
│   │   ├───adapters
│   │   ├───dtos
│   │   │   └───events
│   │   ├───ports
│   │   │   └───llm
│   │   └───use-cases
│   │       └───events
│   ├───config
│   │   └───env
│   ├───domain
│   │   ├───entities
│   │   ├───interfaces
│   │   │   ├───repositories
│   │   │   └───services
│   │   └───value-objects
│   ├───infrastructure
│   │   ├───external
│   │   │   ├───calendar
│   │   │   │   ├───config
│   │   │   │   ├───mappers
│   │   │   │   └───services
│   │   │   ├───llm
│   │   │   │   ├───prompts
│   │   │   │   └───services
│   │   │   └───telegram
│   │   │       ├───mappers
│   │   │       └───services
│   │   └───persistence
│   │       ├───calendar
│   │       └───repositories
│   ├───presentation
│   │   └───telegram
│   │       │   telegram.module.ts
│   │       └───services
│   └───shared
│       ├───filters
│       ├───pipes
│       └───utils
│
└───test
        app.e2e-spec.ts
        jest-e2e.json
```

## ⚙️ Setup y primer uso

### 1. Clona el repositorio e instala dependencias

```bash
git clone <repo-url>
cd reminder-gram
npm install
```

### 2. Configura credenciales y variables de entorno

* **Crea tu bot** en Telegram y consigue el token con [@BotFather](https://t.me/BotFather).
* **Activa la API de Google Calendar** en [Google Cloud Console](https://console.cloud.google.com/).
* Descarga tu `client_secret.json` de Google Cloud y colócalo en `/private`.
* Crea un `.env` con tus claves (ejemplo):

```
TELEGRAM_BOT_TOKEN=tu-token
OPENAI_API_KEY=sk-...
LLM_MODEL=gpt-4o
PORT=3000
NODE_ENV=development
TELEGRAM_ADMIN_CHAT_ID=tu-chat-id
CRON_TIME=08:00
```

### 3. Autoriza acceso a Google Calendar

Lanza el script para autorizar el bot (solo la primera vez):

```bash
npx ts-node scripts/generate-calendar-token.ts
```

* Sigue las instrucciones en consola para dar acceso de Google Calendar con el usuario deseado.

### 4. Arranca el bot

```bash
npm run start:dev
```

¡Y listo!

## 🧑‍💼 **¿Cómo se usa?**

**¡Como un chat normal!**
No tienes que usar comandos.

* **Consulta tu agenda**:

  > “¿Qué tengo esta semana?”
  > “¿Tengo algo mañana?”
* **Crea eventos**:

  > “Reunión con Pedro mañana a las 9:00”
  > “Cita médica el lunes a las 10:00”
  > “Vacaciones todo el día el viernes”

El bot **interpreta tu mensaje**, crea el evento en Google Calendar o te responde tus próximos eventos.
**Entiende español natural, fechas, horas, y eventos de día completo.**

**Ejemplo de respuesta:**

```
He creado el evento "Reunión con Pedro" para el día 24/5/2025 de 09:00 a 10:00.
```

O para all-day:

```
He creado el evento "Vacaciones" para el día 30/5/2025 (todo el día).
```

## 🛡️ Seguridad y buenas prácticas

* **NO subas** `client_secret.json` ni nada de `/private` a repos públicos.
* Añade `/private/` y `.env` a tu `.gitignore`.
* Haz backup regular de tu `client_secret.json` si lo modificas.

## 🏁 Conclusión

AI Secretary Bot es tu **secretario privado para la agenda** en Telegram.
Extensible, modular y listo para evolucionar (tareas, Notion, otros LLM) pero ahora 100% centrado en **Google Calendar** y gestión natural de eventos.

