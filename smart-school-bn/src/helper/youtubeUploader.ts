import fs from "fs";
import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

interface UploadOptions {
  title: string;
  description?: string;
  tags?: string[];
  privacyStatus?: "unlisted" | "private" | "public";
  filePath: string;
}

class YouTubeUploader {
  private oAuth2Client;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Missing Google OAuth environment variables");
    }

    this.oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    this.loadTokensFromEnv();
  }

  /** Load tokens from environment variables */
  private loadTokensFromEnv() {
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      this.oAuth2Client.setCredentials({
        access_token: process.env.GOOGLE_ACCESS_TOKEN,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        expiry_date: process.env.GOOGLE_TOKEN_EXPIRY
          ? Number(process.env.GOOGLE_TOKEN_EXPIRY)
          : undefined,
      });

      // Auto-update tokens (useful if refresh happens)
      this.oAuth2Client.on("tokens", (tokens) => {
        console.log("🔄 Tokens refreshed.");
        if (tokens.refresh_token) {
          console.log("⚠️ New refresh token issued. Update your .env!");
        }
        if (tokens.expiry_date) {
          console.log("New expiry:", tokens.expiry_date);
        }
      });
    }
  }

  /** Get the URL for manual authorization (first time only) */
  getAuthUrl(): string {
    const SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];
    return this.oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
  }

  /** Exchange authorization code for tokens (first time only) */
  async getAndPrintTokens(code: string): Promise<void> {
    const { tokens } = await this.oAuth2Client.getToken(code);
    console.log("✅ Paste these values in your .env file:\n");
    console.log("GOOGLE_ACCESS_TOKEN=", tokens.access_token);
    console.log("GOOGLE_REFRESH_TOKEN=", tokens.refresh_token);
    console.log("GOOGLE_TOKEN_EXPIRY=", tokens.expiry_date);
  }

  /** Uploads video and returns YouTube URL */
  async uploadVideo(options: UploadOptions): Promise<string> {
    const youtube = google.youtube({
      version: "v3",
      auth: this.oAuth2Client,
    });

    const res = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: options.title,
          description: options.description || "",
          tags: options.tags || [],
          categoryId: "22", // People & Blogs
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
    if (!videoId) {
      throw new Error("Failed to upload video: No video ID returned.");
    }

    return `https://youtu.be/${videoId}`;
  }
}

export default YouTubeUploader;
