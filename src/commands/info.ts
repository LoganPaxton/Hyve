import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import * as fs from 'fs/promises';

const USERS_FILE_PATH = "users.json";

export const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Get information about someone's Roblox account!")
  .addStringOption((option) =>
    option
      .setName("username")
      .setDescription("A Roblox username")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const username = interaction.options.getString("username");

  if (!username) {
    return interaction.reply({ content: "You must provide a username to use this command!", ephemeral: true });
  }

  const users = await fs.readFile(USERS_FILE_PATH, { encoding: "utf-8" });
  const json = JSON.parse(users);


  // Get robloxId from username via Roblox API
  let robloxIdFromApi: string | null = null;
  try {
    const idRes = await fetch(`https://users.roblox.com/v1/usernames/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
    });
    if (idRes.ok) {
      const idData = await idRes.json();
      if (idData.data && idData.data[0] && idData.data[0].id) {
        robloxIdFromApi = idData.data[0].id.toString();
      }
    }
  } catch (err) {
    // Ignore errors, fallback to null
  }

  // Find user by robloxId from API
  const user = json.find((u: any) => u.robloxId === robloxIdFromApi);

  if (!user) {
    return interaction.reply({ content: "User has not linked their account yet!", ephemeral: true });
  }

  // Fetch Roblox info from API endpoints
  let robloxUsername = "Unknown";
  let robloxDescription = "No description set.";
  let robloxPFP = "https://tr.rbxcdn.com/0e6b6e6b6e6b6e6b6e6b6e6b6e6b6e6b/150/150/Image/Png";

  try {
    // Get Roblox username and description
    const userInfoRes = await fetch(`https://users.roblox.com/v1/users/${user.robloxId}`);
    if (userInfoRes.ok) {
      const userInfo = await userInfoRes.json();
      robloxUsername = userInfo.name || robloxUsername;
      robloxDescription = userInfo.description || robloxDescription;
    }
    // Get Roblox profile picture
    const pfpRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.robloxId}&size=150x150&format=Png&isCircular=true`);
    if (pfpRes.ok) {
      const pfpData = await pfpRes.json();
      if (pfpData.data && pfpData.data[0] && pfpData.data[0].imageUrl) {
        robloxPFP = pfpData.data[0].imageUrl;
      }
    }
  } catch (err) {
    // Ignore errors, fallback to defaults
  }

  const discordId = user.discordId || "Unknown";
  const robloxId = user.robloxId || "Unknown";

  const embed = {
    color: 0xFFD700,
    title: `Roblox Info for ${robloxUsername}`,
    thumbnail: { url: robloxPFP },
    fields: [
      {
        name: "Discord Username",
        value: `<@${discordId}>`,
        inline: true,
      },
      {
        name: "Discord User ID",
        value: `\`${discordId}\``,
        inline: true,
      },
      {
        name: "Roblox Username",
        value: robloxUsername,
        inline: true,
      },
      {
        name: "Roblox User ID",
        value: `\`${robloxId}\``,
        inline: true,
      },
      {
        name: "Roblox Description",
        value: robloxDescription,
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "Hyve | Roblox Account Info",
      icon_url: "https://cdn.discordapp.com/avatars/1395958309940494437/040225a191e70abc878c05d012c05759.webp"
    }
  };

  return interaction.reply({ embeds: [embed], ephemeral: true });
}