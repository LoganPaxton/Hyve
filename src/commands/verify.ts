import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import * as fs from 'fs/promises';

const charset = "ABCDEFGHJIKLMNOPQRSTUVWXYZ1234567890";
const USERS_FILE_PATH = "users.json";

export const data = new SlashCommandBuilder()
  .setName("verify")
  .setDescription("Verify your account using Hyve!")
  .addStringOption((option) =>
    option
      .setName("username")
      .setDescription("Your Roblox username")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const username = interaction.options.getString("username");

  if (!username) {
    return interaction.reply({ content: "You must provide a username to use this command!", ephemeral: true });
  }

  try {
    const fileData = await fs.readFile(USERS_FILE_PATH, { encoding: "utf-8" });
    const users = JSON.parse(fileData);

    // Find if a user with this Discord ID already exists in the file
    const existingUser = users.find((user: any) => user.discordId === interaction.user.id);

    if (existingUser) {
      // User is already linked
      return interaction.reply({
        content: `You are already linked to Roblox user ID: \`${existingUser.robloxId}\`.`,
        ephemeral: true
      });
    }

    // If the user is not found, you can proceed with a new linking process.
    // For this example, we'll just inform the user they are not linked.
    return interaction.reply({
      content: `Your Discord account is not yet linked. Please use the \`/link\` command to start the linking process with your Roblox username.`,
      ephemeral: true
    });

  } catch (error: any) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      // The file doesn't exist or is empty/invalid JSON
      return interaction.reply({
        content: `Your Discord account is not yet linked. Please use the \`/link\` command to start the linking process.`,
        ephemeral: true
      });
    } else {
      console.error("Error reading users.json:", error);
      return interaction.reply({
        content: "There was an error while trying to verify your account. Please try again later.",
        ephemeral: true
      });
    }
  }
}