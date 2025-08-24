
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

// Settings object, export for use in other commands
export const settings = {
  embedColor: 0x5865F2,
  ephemeralReplies: true,
  footerText: "Hyve | Roblox Account Info",
  footerIcon: "https://cdn.discordapp.com/icons/1160999463316416542/2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e.png",
  defaultRobloxPFP: "https://tr.rbxcdn.com/0e6b6e6b6e6b6e6b6e6b6e6b6e6b6e6b/150/150/Image/Png"
};


export const data = new SlashCommandBuilder()
  .setName("setup")
  .setDescription("View and modify bot settings.")
  .addStringOption(option =>
    option.setName("setting")
      .setDescription("Setting to modify (embedColor, ephemeralReplies, footerText, footerIcon, defaultRobloxPFP)")
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName("value")
      .setDescription("New value for the setting")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const setting = interaction.options.getString("setting");
  const value = interaction.options.getString("value");

  let updated = false;
  let message = "";

  if (setting && value) {
    // Validate and update settings
    if (Object.prototype.hasOwnProperty.call(settings, setting)) {
      // Type conversion for boolean
      if (setting === "ephemeralReplies") {
        (settings as any)[setting] = value === "true";
      } else if (setting === "embedColor") {
        (settings as any)[setting] = Number(value);
      } else {
        (settings as any)[setting] = value;
      }
      updated = true;
      message = `Setting \`${setting}\` updated!`;
    } else {
      message = `Unknown setting: \`${setting}\`.`;
    }
  }

  // Build embed showing current settings
  const embed = {
    color: settings.embedColor,
    title: "Bot Settings",
    description: updated ? message : "Current bot settings:",
    fields: Object.entries(settings).map(([key, val]) => ({
      name: key,
      value: typeof val === "boolean" ? (val ? "true" : "false") : String(val),
      inline: false
    })),
    footer: {
      text: settings.footerText,
      icon_url: settings.footerIcon
    }
  };

  return interaction.reply({ embeds: [embed], ephemeral: true });
}