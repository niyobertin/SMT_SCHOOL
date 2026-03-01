import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { hashPassword } from "../utils/hashPassword";
import prisma from "../services/prisma.singleton";

/**
 * Reusable helper for creating/finding users from OAuth providers
 */
async function findOrCreateUser({
  email,
  firstName,
  lastName,
  avatar,
}: {
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}) {
  let user = await prisma.user.findUnique({ where: { email } });
  const generateRandomPassword = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters.charAt(randomIndex);
    }
    return password;
  };

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        username: email.split("@")[0] + Date.now(),
        firstName,
        lastName,
        password: await hashPassword(generateRandomPassword()),
        avatar,
        isVerified: true,
      },
    });
  }

  return user;
}

// ✅ Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ["email", "profile"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email found in Google profile"), false);

        const firstName = profile.name?.givenName || "Google";
        const lastName = profile.name?.familyName || "User";
        const avatar = profile.photos?.[0]?.value;

        const user = await findOrCreateUser({ email, firstName, lastName, avatar });
        return done(null, user);
      } catch (error) {
        console.error("Google OAuth Error:", error);
        return done(error as any, false);
      }
    }
  )
);

// ✅ Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
      profileFields: ["id", "displayName", "emails", "name", "photos"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let email = profile.emails?.[0]?.value;
        if (!email) {
          // fallback because Facebook sometimes doesn’t return email
          email = `${profile.id}@facebook.com`;
        }

        const names = profile.displayName?.split(" ") || [];
        const firstName = names[0] || "Facebook";
        const lastName = names.slice(1).join(" ") || "User";
        const avatar = profile.photos?.[0]?.value;

        const user = await findOrCreateUser({ email, firstName, lastName, avatar });
        return done(null, user);
      } catch (error) {
        console.error("Facebook OAuth Error:", error);
        return done(error as any, false);
      }
    }
  )
);

// ✅ Serialize user into session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// ✅ Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
