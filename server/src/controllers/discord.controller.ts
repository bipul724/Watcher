import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';

/**
 * Fetch public information of the globally configured Discord bot
 */
export async function getBotInfo(req: AuthenticatedRequest, res: Response) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    return res.json({ isActive: false, error: 'Global bot token not configured' });
  }

  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bot ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Discord API responded with status ${response.status}`);
    }

    const data: any = await response.json();
    
    // Construct tag format (handle new username formats as well as old discriminators)
    const tag = data.discriminator && data.discriminator !== '0'
      ? `${data.username}#${data.discriminator}`
      : `@${data.username}`;

    return res.json({
      isActive: true,
      clientId: data.id,
      username: tag,
      avatar: data.avatar 
        ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png` 
        : null,
    });
  } catch (error: any) {
    console.error('[Discord Controller] Failed to fetch bot info:', error.message);
    return res.json({
      isActive: false,
      error: 'Failed to fetch bot details from Discord API',
    });
  }
}
