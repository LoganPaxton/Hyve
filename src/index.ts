import { Client, InteractionReplyOptions } from "discord.js";
import { deployCommands } from "./deploy-commands";
import { commands } from "./commands";
import { config } from "./config";
import * as fs from 'fs/promises';

const USERS_FILE_PATH = "users.json";

const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

client.once("ready", () => {
  console.log("Discord bot is ready! 🤖");
  client.guilds.cache.forEach(async (guild) => {
    await deployCommands({ guildId: guild.id });
  });
});

client.on("guildCreate", async (guild) => {
  await deployCommands({ guildId: guild.id });
});

client.on("interactionCreate", async (interaction) => {
  // Handle Slash Commands
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;
    if (commands[commandName as keyof typeof commands]) {
      commands[commandName as keyof typeof commands].execute(interaction);
    }
  }

  // Handle Button Clicks
  if (interaction.isButton()) {
    const [action, prefix, code, userId] = interaction.customId.split("_");

    if (action === "verify" && prefix === "hyve" && code && userId) {
      try {
        await interaction.deferReply({ ephemeral: true });

        // Fetch the Roblox user's description
        const res = await fetch(`https://users.roblox.com/v1/users/${userId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`HTTP Error. Status: ${res.status}. Message: ${JSON.stringify(errorData)}`);
        }
        const data = await res.json();
        const description = data.description || "";

        if (description.includes(code)) {
          // Verification successful!
          try {
            const fileData = await fs.readFile(USERS_FILE_PATH, { encoding: "utf8" });
            let users = JSON.parse(fileData);
            if (!Array.isArray(users)) {
              users = [];
            }
            users.push({ discordId: interaction.user.id, robloxId: userId });
            await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2));
          } catch (fileError: any) {
            if (fileError.code === "ENOENT") {
              // If the file doesn't exist, create it with the new user
              const newUser = [{ discordId: interaction.user.id, robloxId: userId }];
              await fs.writeFile(USERS_FILE_PATH, JSON.stringify(newUser, null, 2));
            } else {
              throw fileError;
            }
          }

          await interaction.editReply({
            content: "✅ Your Roblox account has been successfully linked!",
          });

        } else {
          await interaction.editReply({
            content: "❌ The code was not found in your Roblox description. Please make sure it is there and try again.",
          });
        }
      } catch (error: any) {
        console.error("Error during Roblox verification:", error);
        await interaction.editReply({
          content: `An error occurred during verification. Please try again later. \nError: ${error.message}`,
        });
      }
    }
  }
});

client.login(config.DISCORD_TOKEN);