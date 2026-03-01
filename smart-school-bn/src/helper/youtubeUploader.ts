import fs from "fs";
import { google } from "googleapis";
// import open from "open";
import logger from "../utils/logger";
import prisma from "../services/prisma.singleton";

interface UploadOptions {
  title: string;
  description?: string;
  tags?: string[];
  privacyStatus?: "unlisted" | "private" | "public";
  filePath: string;
}

class YouTubeUploader {
  public oAuth2Client;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

    this.oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  /** Load tokens from DB if available */
  async init() {
    const tokenRecord = await prisma.youTubeToken.findFirst({ where: { provider: "youtube" } });
    if (tokenRecord) {
      const tokens = JSON.parse(tokenRecord.credentials);
      this.oAuth2Client.setCredentials(tokens);

      // Save refreshed tokens automatically
      this.oAuth2Client.on("tokens", async (tokens) => {
        if (tokens.access_token) {
          logger.info("🔄 Tokens refreshed, saving to DB...");
          await prisma.youTubeToken.update({
            where: { id: tokenRecord.id },
            data: {
              credentials: JSON.stringify(this.oAuth2Client.credentials),
              expiryDate: this.oAuth2Client.credentials.expiry_date
                ? new Date(this.oAuth2Client.credentials.expiry_date)
                : null,
            },
          });
        }
      });
    }
  }

  /** Generate Google OAuth URL */
  getAuthUrl(): string {
    return this.oAuth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/youtube.upload"],
    });
  }

  /** Exchange OAuth code for tokens and save to DB */
  async exchangeCodeForToken(code: string) {
    const { tokens } = await this.oAuth2Client.getToken(code);
    this.oAuth2Client.setCredentials(tokens);

    // Remove old tokens
    await prisma.youTubeToken.deleteMany({ where: { provider: "youtube" } });

    // Save new token
    await prisma.youTubeToken.create({
      data: {
        provider: "youtube",
        credentials: JSON.stringify(tokens),
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });

    logger.info("✅ Tokens saved in database");
  }

  /** Ensure token is valid, refresh if expired */
  private async ensureValidToken(): Promise<boolean> {
    const tokenRecord = await prisma.youTubeToken.findFirst({ where: { provider: "youtube" } });
    if (!tokenRecord) return false;

    this.oAuth2Client.setCredentials(JSON.parse(tokenRecord.credentials));

    try {
      // Get a valid access token (automatically refreshes if expired)
      const accessToken = await this.oAuth2Client.getAccessToken();
      if (!accessToken.token) throw new Error("Unable to refresh token");

      // Save updated credentials
      await prisma.youTubeToken.update({
        where: { id: tokenRecord.id },
        data: {
          credentials: JSON.stringify(this.oAuth2Client.credentials),
          expiryDate: this.oAuth2Client.credentials.expiry_date
            ? new Date(this.oAuth2Client.credentials.expiry_date)
            : null,
        },
      });

      logger.info("🔄 Token is valid");
      return true;
    } catch (err) {
      logger.error("❌ Failed to refresh token. Deleting from DB...");
      await prisma.youTubeToken.delete({ where: { id: tokenRecord.id } });
      return false;
    }
  }

  /** Upload video with automatic token handling */
  async uploadVideo(options: UploadOptions): Promise<string> {
    let valid = await this.ensureValidToken();

    if (!valid) {
      // No valid token, prompt user to authorize
      const authUrl = this.getAuthUrl();
      logger.info("⚠️ No valid token found. Visit this URL to authorize:");
      logger.info(authUrl);
      // await open(authUrl);

      // Wait for token to appear in DB (max 5 min)
      const maxWait = 300000;
      const start = Date.now();
      while (Date.now() - start < maxWait) {
        await new Promise((res) => setTimeout(res, 5000));
        valid = await this.ensureValidToken();
        if (valid) break;
      }

      if (!valid) throw new Error("Authorization required. You did not complete OAuth flow.");
    }

    const youtube = google.youtube({ version: "v3", auth: this.oAuth2Client });

    try {
      const res = await youtube.videos.insert({
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: options.title,
            description: options.description || "",
            tags: options.tags || [],
            categoryId: "22",
          },
          status: {
            privacyStatus: options.privacyStatus || "unlisted",
          },
        },
        media: {
          body: fs.createReadStream(options.filePath),
        },
      });

      if (!res.data.id) throw new Error("Upload failed: No video ID returned.");
      return `https://youtu.be/${res.data.id}`;
    } catch (err: any) {
      logger.error(err);
      throw err;
    }
  }
}

export default YouTubeUploader;
