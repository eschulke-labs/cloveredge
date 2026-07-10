import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

// No transactional email provider is configured yet (Phase 5). In dev, log
// the magic link to the server console instead of sending a real email.
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
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
