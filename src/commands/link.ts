// src/commands/link.ts

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

const charset = "ABCDEFGHJIKLMNOPQRSTUVWXYZ1234567890";

export const data = new SlashCommandBuilder()
  .setName("link")
  .setDescription("Link your Roblox account with Hyve!")
  .addStringOption((option) =>
    option
      .setName("username")
      .setDescription("Your Roblox username")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const username = interaction.options.getString("username");
  let userId;

  if (!username) {
    return interaction.reply({
      content: "You must provide a username.",
      ephemeral: true,
    });
  }

  // Generate Code
  let code = "hyve-";
  for (let i = 0; i < 6; i++) {
    code += charset.charAt(Math.ceil(Math.random() * charset.length));
  }

  // Get user ID from username
  try {
    const res = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        "usernames": [username],
        "excludeBannedUsers": false
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP Error. Status: ${res.status}`);
    }

    const data = await res.json();
    if (data.data.length > 0) {
      userId = data.data[0].id;
    } else {
      return interaction.reply({
        content: "Roblox user not found. Please check the username and try again.",
        ephemeral: true
      });
    }
  } catch (error) {
    console.error("Error fetching Roblox user data: ", error);
    return interaction.reply({
      content: "There was an error while trying to find that Roblox user.",
      ephemeral: true
    });
  }

  // You can now store the code and userId for later verification
  console.log(`Generated code for user ${username} (ID: ${userId}): ${code}`);

  // Create the embed
  const embed = new EmbedBuilder()
    .setTitle("Link your Account")
    .setDescription(
      `Please enter the following code into your Roblox description.\nCode: \`${code}\`\n\nOnce finished, press the button down below.`
    )
    .setColor("Yellow");

  // Create the button
  const button = new ButtonBuilder()
    .setCustomId(`verify_hyve_${code}_${userId}`)
    .setLabel("Verify")
    .setStyle(ButtonStyle.Secondary);

  // Create an action row to hold the button
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

  // Send the reply with the embed and button
  await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true,
  });
}