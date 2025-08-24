import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import * as fs from 'fs/promises';

const USERS_FILE_PATH = "users.json";

export const data = new SlashCommandBuilder()
  .setName("unlink")
  .setDescription("Unlink your account with Hyve!");

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const fileData = await fs.readFile(USERS_FILE_PATH, { encoding: "utf-8" });
    let users = JSON.parse(fileData);

    // Find the user's entry
    const userIndex = users.findIndex(
      (user: any) => user.discordId === interaction.user.id
    );

    if (userIndex === -1) {
      // User is not found, so they are not linked
      return interaction.reply({
        content: "Your account is not currently linked.",
        ephemeral: true,
      });
    }

    // Remove the user from the array
    users.splice(userIndex, 1);

    // Write the updated data back to the file
    await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2));

    return interaction.reply({
      content: "✅ Your account has been successfully unlinked!",
      ephemeral: true,
    });

  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, so no users are linked
      return interaction.reply({
        content: "Your account is not currently linked.",
        ephemeral: true,
      });
    } else {
      console.error("Error unlinking account:", error);
      return interaction.reply({
        content: "There was an error while trying to unlink your account. Please try again later.",
        ephemeral: true,
      });
    }
  }
}