import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

// Real delivery via Resend when AUTH_RESEND_KEY is set (production, and any
// local env that has it); otherwise log the magic link to the server
// console instead — useful for local dev without burning real sends.
const emailProvider = process.env.AUTH_RESEND_KEY
  ? Resend({ apiKey: process.env.AUTH_RESEND_KEY, from: process.env.EMAIL_FROM })
  : Resend({
      apiKey: "dev",
      from: "dev@localhost",
      async sendVerificationRequest({ identifier, url }) {
        console.log(`\n[auth] Magic link for ${identifier}:\n${url}\n`);
      },
    });

const config = {
  adapter: PrismaAdapter(prisma),
  providers: [emailProvider],
  session: { strategy: "database" },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.tier = (user as unknown as { tier: "FREE" | "PAID" }).tier;
      session.user.isAdmin = (user as unknown as { isAdmin: boolean }).isAdmin;
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
