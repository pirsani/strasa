import { DefaultSession } from "next-auth";

// nextauth.d.ts

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User {
    id: string;
    nip?: string | null;
    unitKerjaId?: string | null; // ini basically adalah organisasiId
    unitKerjaNama?: string | null;
    satkerId?: string | null; // sedangkan ini adalah organisasiId terdekat yang merupakan satker anggaran
    satkerNama?: string | null;
    organisasiId?: string | null;
    organisasiNama?: string | null;
    roles?: string[];
    permissions?: string[];
  }
  interface Session {
    user: User & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    id: string;
    roles: string[];
    organisasiId?: string | null;
    organisasiNama?: string | null;
    nip?: string | null;
    permissions?: string[];
  }
}
