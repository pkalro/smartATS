import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

const devUserId = process.env.DEV_USER_ID;

async function getDevSession() {
  if (!devUserId) return null;
  const user = await prisma.user.findUnique({ where: { id: devUserId } });
  if (!user) return null;
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    },
    expires: new Date(Date.now() + 30 * 86400_000).toISOString(),
  };
}

// In dev-bypass mode, `auth` works as both `auth()` and `auth(handler)`
// (the latter is how middleware uses it). The wrapper form runs on the Edge
// runtime — Prisma can't load there, so we attach a stub session (just enough
// for `!!req.auth` checks). The standalone form runs in the Node runtime
// from server components/actions, so it can hit the DB for the full user.
const STUB_SESSION = {
  user: { id: devUserId, name: "Dev (loading)", email: null, image: null },
  expires: new Date(Date.now() + 30 * 86400_000).toISOString(),
};

function devAuth(handler?: unknown): unknown {
  if (typeof handler === "function") {
    return async (req: unknown, ...rest: unknown[]) => {
      (req as { auth: unknown }).auth = STUB_SESSION;
      return (handler as (...a: unknown[]) => unknown)(req, ...rest);
    };
  }
  return getDevSession();
}

const real = devUserId
  ? null
  : NextAuth({
      providers: [Google],
      session: { strategy: "jwt" },
      pages: { signIn: "/login" },
      callbacks: {
        async signIn({ user, account, profile }) {
          // Upsert the user in DB on every Google sign-in and override user.id
          // with the DB cuid so the jwt callback receives the correct id.
          if (account?.provider === "google" && profile?.email) {
            const dbUser = await prisma.user.upsert({
              where: { email: profile.email },
              update: {
                name: profile.name ?? undefined,
                image: (profile as { picture?: string }).picture ?? undefined,
              },
              create: {
                email: profile.email,
                name: profile.name ?? null,
                image: (profile as { picture?: string }).picture ?? null,
              },
            });
            user.id = dbUser.id;
          }
          return true;
        },
        async jwt({ token, user }) {
          // user is only present on the initial sign-in event
          if (user?.id) token.userId = user.id;
          return token;
        },
        session({ session, token }) {
          if (session.user && token.userId) {
            session.user.id = token.userId as string;
          }
          return session;
        },
      },
    });

const noopResponse = () =>
  new Response("dev mode — NextAuth disabled", { status: 200 });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth: any = devUserId ? devAuth : real!.auth;
export const handlers = real?.handlers ?? { GET: noopResponse, POST: noopResponse };
export const signIn = real?.signIn ?? (async () => {});
export const signOut = real?.signOut ?? (async () => {});
