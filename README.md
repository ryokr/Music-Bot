# MeowBot - Discord Bot


## Prerequisites

Before you begin, make sure you have the following installed:

- **[Node.js](https://nodejs.org/en/)** (Version 18)
- **[NPM](https://www.npmjs.com/)** (comes bundled with Node.js)
- **[FFMPEG](https://www.ffmpeg.org/)**


## Installation

Follow these steps to set up MeowBot:

1. **Clone the Repository**

    ```bash
    git clone https://github.com/ryokr/MeowBot.git
    ```

2. **Navigate to the Project Directory**

    ```bash
    cd MeowBot
    ```

3. **Install Dependencies**

    ```bash
    npm install
    ```

4. **Configure Discord Bot Token**

    Create a `.env` file and add your token:

    ```bash
    echo "token=INSERT_YOUR_TOKEN_HERE" > .env
    ```


## Bot Permissions

To ensure MeowBot works properly, set the following permissions:

- **Application Scope:** Enable `applications.commands` in the **OAuth2** tab on the [Developer Portal](https://discord.com/developers/applications/).

- **Intents:** Enable `Server Members Intent` and `Message Content Intent` in the **Bot** tab on the [Developer Portal](https://discord.com/developers/applications/).


## Configuration

After installation, configure your bot:

1. **Add Discord API Token:**

    Open the `.env` file and paste your token.

2. **Customize Bot Status:**

    Edit the `activity` and other related variables in the `config.json` file to set your bot's status and other settings.


## Starting the Bot

To start MeowBot, run:

```bash
node index.js
```

## Hosting

This bot can be host anywhere that support nodejs.

## Support

Contact me [ryokr](https://discord.gg/fTuGFk9ayG) for any issue.

## Credits

If you consider using this Bot, make sure to credit me ><.
Example: `Bot Coded by [ryohuy2410](https://discord.gg/fTuGFk9ayG) but modified by [modifier/your Name](https://discord.gg/)` :3.

## Contributing

If you want to help improve the Bot code, fix spelling or design Errors or if possible even code errors, you may create PULL REQUESTS.
Please consider, that [**ryohuy2410**](https://github.com/ryokr) is the main Developer of this Bot, everyone else helped just once or sometimes more often.
Thanks to anyone who considers helping me :3.