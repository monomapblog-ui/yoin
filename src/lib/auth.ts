import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!valid) return null;
        return {
          id:          user.id,
          email:       user.email,
          name:        user.displayName,
          image:       user.avatarUrl,
          role:        user.role,
          displayName: user.displayName,
        };
      },
    }),
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Twitter({
      clientId:     process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // OAuth ログイン時: displayName が空なら name から補完
      if (account?.provider !== "credentials" && user.id) {
        const dbUser = await prisma.user.findUnique({
          where:  { id: user.id },
          select: { displayName: true, role: true },
        });
        if (dbUser && (!dbUser.displayName || dbUser.displayName === "")) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              displayName: user.name ?? user.email?.split("@")[0] ?? "ユーザー",
              emailVerified: new Date(), // OAuth はメール確認済みとして扱う
            },
          });
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id          = user.id;
        token.role        = (user as { role?: string }).role;
        token.displayName = (user as { displayName?: string }).displayName ?? user.name;
      }
      // セッション更新（プロフィール変更後に呼ばれる）
      if (trigger === "update" && session) {
        token.displayName = session.displayName;
        token.picture     = session.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        const u = session.user as {
          id?: string;
          role?: string;
          displayName?: string;
          name?: string | null;
          email?: string | null;
          image?: string | null;
        };
        u.id          = token.id as string;
        u.role        = token.role as string;
        u.displayName = token.displayName as string | undefined;
      }
      return session;
    },
  },
});
