import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { google } from "googleapis";
import open from "open";
import logger from "../utils/logger";

dotenv.config();

interface UploadOptions {
  title: string;
  description?: string;
  tags?: string[];
  privacyStatus?: "unlisted" | "private" | "public";
  filePath: string;
}

class YouTubeUploader {
  public oAuth2Client;
  private tokenPath: string;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

    this.oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    this.tokenPath = path.join(process.cwd(), "youtube_token.json");

    this.loadTokens();
  }

  /** Load tokens from file if they exist */
  private loadTokens() {
    if (fs.existsSync(this.tokenPath)) {
      const tokens = JSON.parse(fs.readFileSync(this.tokenPath, "utf-8"));
      this.oAuth2Client.setCredentials(tokens);

      this.oAuth2Client.on("tokens", (tokens) => {
        if (tokens.access_token) {
          logger.info("🔄 Tokens refreshed, saving...");
          fs.writeFileSync(this.tokenPath, JSON.stringify(tokens, null, 2));
        }
      });
    }
  }

  /** Get Google auth URL for first-time login */
  getAuthUrl(): string {
    return this.oAuth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/youtube.upload"],
    });
  }

  /** Exchange code for tokens and save */
  async exchangeCodeForToken(code: string) {
    const { tokens } = await this.oAuth2Client.getToken(code);
    this.oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(this.tokenPath, JSON.stringify(tokens, null, 2));
    logger.info("✅ Tokens saved to youtube_token.json");
  }

  /** Upload video */
  async uploadVideo(options: UploadOptions): Promise<string> {
    if (!this.oAuth2Client.credentials.refresh_token && !this.oAuth2Client.credentials.access_token) {
      logger.info("⚠️ No token found. Visit the following URL to authorize:");
      const authUrl = this.getAuthUrl();
      logger.info(authUrl);
      await open(authUrl);
      throw new Error("Authorization required. Complete the OAuth flow via /oauth2callback.");
    }

    const youtube = google.youtube({ version: "v3", auth: this.oAuth2Client });

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

    const videoId = res.data.id;
    if (!videoId) throw new Error("Failed to upload video: No video ID returned.");

    return `https://youtu.be/${videoId}`;
  }
}

export default YouTubeUploader;
