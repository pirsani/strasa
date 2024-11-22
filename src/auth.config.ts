import bcrypt from "bcryptjs"; // Import bcrypt for password hashing and comparison
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getNearestSatkerAnggaran } from "./data/organisasi";
import { getUser, getUserRoles } from "./data/user";
import { UncomplexLoginSchema } from "./zod/schemas/login";

export default {
  trustHost: true,
  pages: {
    signIn: "/signin",
    signOut: "/signout",
  },

  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        //validate against the schema
        const validatedCredentials =
          UncomplexLoginSchema.safeParse(credentials);

        if (validatedCredentials.success) {
          const { email, password } = validatedCredentials.data;

          // logic to verify if the user exists
          // user = await getUserFromDb(credentials.email, pwHash);
          const user = await getUser(email);

          if (!user) {
            // No user found, so this is their first attempt to login
            // meaning this is also the place you could do registration
            //throw new Error("User not found.");
            return null;
          }

          // logic to salt and hash password
          const isValidPassword = await bcrypt.compare(
            password,
            user.password?.toString() || ""
          );

          if (!isValidPassword) {
            // Passwords don't match
            return null;
          }

          // return user object with their profile data
          // model user yang diharapkan oleh next-auth lihat referensi di bawah
          // https://authjs.dev/getting-started/adapters/prisma
          // kemudian sesuaikan dengan model user yang ada di aplikasi dengan memodifikasi `src/next-auth.d.ts`

          // get Nearest Satker Anggaran
          let satkerAnggaran = null;
          if (user.organisasiId) {
            satkerAnggaran = await getNearestSatkerAnggaran(user.organisasiId);
          }

          const roles = await getUserRoles(user.id);

          return {
            ...user,
            unitKerjaId: user.organisasiId,
            unitKerjaNama: user.organisasi?.nama,
            unitKerjaNamaSingkat: user.organisasi?.singkatan,
            satkerId: satkerAnggaran?.id,
            satkerNama: satkerAnggaran?.nama,
            satkerNamaSingkat: satkerAnggaran?.singkatan,
            roles: roles,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
    },
    async signIn({ user, account, profile, email, credentials }) {
      if (!user || !account) {
        throw new Error("Invalid sign in");
      }

      //console.log("[signIn] user", user);
      return true;
    },
    async session({ session, token, user }) {
      //console.log("[session] session", session);
      //console.log("[session] token", token);
      //console.log("[session] user", user);
      session.user.id = token.sub as string;
      session.user.name = token.name;
      session.user.nip = token.nip as string;
      session.user.unitKerjaId = token.unitKerjaId as string;
      session.user.unitKerjaNama = token.unitKerjaNama as string;
      session.user.unitKerjaNamaSingkat = token.unitKerjaNamaSingkat as string;
      session.user.satkerId = token.satkerId as string;
      session.user.satkerNama = token.satkerNama as string;
      session.user.satkerNamaSingkat = token.satkerNamaSingkat as string;
      session.user.roles = token.roles as string[];
      session.user.permissions = token.permissions as string[];
      return session;
    },
    async jwt({ token, user, account, profile }) {
      //console.log("[jwt] token", token);
      //console.log("[jwt] account", account);
      if (user) {
        console.log("[jwt] user", user);
        token.id = user.id;
        token.name = user.name;
        token.nip = user.nip;
        token.unitKerjaId = user.unitKerjaId;
        token.unitKerjaNama = user.unitKerjaNama;
        token.unitKerjaNamaSingkat = user.unitKerjaNamaSingkat;
        token.satkerId = user.satkerId;
        token.satkerNama = user.satkerNama;
        token.satkerNamaSingkat = user.satkerNamaSingkat;
        token.roles = user.roles as string[];
        token.permissions = user.permissions;
      }
      return token;
    },
  },
} satisfies NextAuthConfig;
