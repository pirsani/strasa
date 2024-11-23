// "use server";
export interface RouteItem {
  name: string;
  title: string;
  href: string;
  icon: string;
  order?: number;
  counter?: number;
  permissions?: string[];
  displayAsMenu?: boolean;
  cascadePermissions?: boolean; // cascade permissions to sub routes
  resources?: string[];
}

export const DEFAULT_ROUTE_AFTER_LOGIN = "/dashboard";

export const loginRoutes: RouteItem[] = [
  {
    name: "login",
    title: "Login",
    href: "/login",
    icon: "key",
    order: 2,
    displayAsMenu: false,
  },
  {
    name: "login",
    title: "Login",
    href: "/",
    icon: "key",
    order: 2,
    displayAsMenu: false,
  },
];

export const isLoginRoute = (url: string) => {
  return loginRoutes.some((route) => route.href === url);
};

export const publicRoutes: RouteItem[] = [
  {
    name: "doc",
    title: "Documentation",
    href: "/doc",
    icon: "key",
    order: 2,
    displayAsMenu: false,
  },
  {
    name: "login",
    title: "Login",
    href: "/login",
    icon: "key",
    order: 2,
    displayAsMenu: false,
  },
  {
    name: "reset-password",
    title: "Reset Password",
    href: "/reset-password",
    icon: "square-asterisk",
    order: 3,
    displayAsMenu: false,
  },
];

export const isPublicRoute = (url: string) => {
  return publicRoutes.some((route) => route.href === url);
};

export const dashboardRoutes: RouteItem[] = [
  {
    name: "dashboard",
    title: "Dashboard",
    href: "/dashboard",
    icon: "gauge",
    order: 0,
    displayAsMenu: true,
  },
  {
    name: "workbench",
    title: "Workbench",
    href: "/workbench",
    icon: "square-activity",
    order: 1,
    displayAsMenu: true,
  },
  {
    name: "pending",
    title: "Pending Matters",
    href: "/pending",
    icon: "monitor-pause",
    order: 1,
    displayAsMenu: true,
  },
];

export const alurProsesRoutes: RouteItem[] = [
  {
    name: "setup-kegiatan",
    title: "0. Setup kegiatan",
    href: "/setup-kegiatan",
    icon: "settings-2",
    order: 0,
    displayAsMenu: true,
    resources: ["proses-setup-kegiatan"],
  },
  {
    name: "pengajuan-kegiatan",
    title: "1. Pengajuan",
    href: "/pengajuan",
    icon: "milestone",
    order: 1,
    displayAsMenu: true,
    resources: ["proses-pengajuan"],
  },
  {
    name: "verifikasi-kegiatan",
    title: "2. verifikasi",
    href: "/verifikasi",
    icon: "list-checks",
    order: 2,
    displayAsMenu: true,
    resources: ["proses-verifikasi"],
  },
  {
    name: "daftar-nominatif",
    title: "3. Daftar Nominatif",
    href: "/daftar-nominatif",
    icon: "table",
    order: 3,
    displayAsMenu: true,
    resources: ["proses-daftar-nominatif"],
  },
  {
    name: "pembayaran-kegiatan",
    title: "4. Pembayaran",
    href: "/pembayaran",
    icon: "credit-card",
    order: 4,
    displayAsMenu: true,
    resources: ["proses-pembayaran"],
  },
];

export const dataReferensiRoutes: RouteItem[] = [
  {
    name: "referensi-narasumber",
    title: "Narasumber",
    href: "/data-referensi/narasumber",
    icon: "graduation-cap",
    order: 0,
    displayAsMenu: true,
    resources: ["ref-narasumber", "referensi"],
  },
  {
    name: "referensi-materi",
    title: "Materi",
    href: "/data-referensi/materi",
    icon: "book-open",
    order: 0,
    displayAsMenu: true,
    resources: ["ref-materi", "referensi"],
  },
  {
    name: "referensi-kelas",
    title: "Kelas",
    href: "/data-referensi/kelas",
    icon: "grid",
    order: 0,
    displayAsMenu: true,
    resources: ["ref-kelas", "referensi"],
  },
  {
    name: "referensi-sbm-honorarium",
    title: "SBM Honorarium",
    href: "/data-referensi/sbm/honorarium",
    icon: "banknote",
    order: 1,
    displayAsMenu: true,
    resources: ["ref-sbm-honorarium", "referensi"],
  },
  {
    name: "referensi-sbm-uh-dalam-negeri",
    title: "SBM UH Dalam Negeri",
    href: "/data-referensi/sbm/uh-dalam-negeri",
    icon: "banknote",
    order: 2,
    displayAsMenu: true,
    resources: ["ref-sbm-uh-dalam-negeri", "referensi"],
  },
  {
    name: "referensi-sbm-uh-luar-negeri",
    title: "SBM UH Luar Negeri",
    href: "/data-referensi/sbm/uh-luar-negeri",
    icon: "banknote",
    order: 3,
    displayAsMenu: true,
    resources: ["ref-sbm-uh-luar-negeri", "referensi"],
  },
  {
    name: "referensi-sbm-uang-representasi",
    title: "SBM Uang Representasi",
    href: "/data-referensi/sbm/uang-representasi",
    icon: "banknote",
    order: 4,
    displayAsMenu: true,
    resources: ["ref-sbm-uang-representasi", "referensi"],
  },
  {
    name: "referensi-sbm-transpor",
    title: "SBM Transpor",
    href: "/data-referensi/sbm/transpor",
    icon: "banknote",
    order: 4,
    displayAsMenu: true,
    resources: ["ref-sbm-transpor", "referensi"],
  },
  // atas permintaan user, referensi sbm taksi dihapus
  // {
  //   name: "referensi-sbm-taksi",
  //   title: "SBM Taksi",
  //   href: "/data-referensi/sbm/taksi",
  //   icon: "banknote",
  //   order: 5,
  //   displayAsMenu: true,
  // },
  {
    name: "referensi-pph",
    title: "PPH",
    href: "/data-referensi/pph",
    icon: "coins",
    order: 5,
    displayAsMenu: true,
    resources: ["ref-pph", "referensi"],
  },
  {
    name: "referensi-pejabat-perbendaharaan",
    title: "Pengelola Keuangan",
    href: "/data-referensi/pejabat-perbendaharaan",
    icon: "signature",
    order: 6,
    displayAsMenu: true,
    resources: [
      "ref-pejabat-perbendaharaan",
      "referensi",
      "ref-pengelola-keuangan",
    ],
  },

  {
    name: "referensi-satker",
    title: "Satker Anggaran",
    href: "/data-referensi/satker-anggaran",
    icon: "brick-wall",
    order: 9,
    resources: ["ref-satker-anggaran", "referensi"],
  },
  {
    name: "referensi-unit-kerja",
    title: "Unit Kerja",
    href: "/data-referensi/unit-kerja",
    icon: "brick-wall",
    order: 9,
    resources: ["ref-unit-kerja", "referensi"],
  },
  {
    name: "referensi-pagu",
    title: "Pagu",
    href: "/data-referensi/pagu",
    icon: "wallet",
    order: 9,
    resources: ["ref-pagu", "referensi"],
  },
  {
    name: "referensi-sp2d",
    title: "SP2D",
    href: "/data-referensi/sp2d",
    icon: "file-badge",
    order: 10,
    displayAsMenu: true,
    resources: ["ref-sp2d", "referensi"],
  },
  {
    name: "referensi-negara",
    title: "Negara",
    href: "/data-referensi/negara",
    icon: "flag",
    order: 11,
    displayAsMenu: true,
    resources: ["ref-negara", "referensi"],
  },
  {
    name: "referensi-provinsi",
    title: "Provinsi",
    href: "/data-referensi/provinsi",
    icon: "map-pinned",
    order: 12,
    displayAsMenu: true,
    resources: ["ref-provinsi", "referensi"],
  },
  {
    name: "referensi-role",
    title: "Role",
    href: "/data-referensi/role",
    icon: "user-cog",
    order: 140,
    displayAsMenu: true,
    resources: ["ref-role"],
  },
  {
    name: "referensi-pengguna",
    title: "Pengguna",
    href: "/data-referensi/pengguna",
    icon: "users",
    order: 150,
    displayAsMenu: true,
    resources: ["ref-pengguna"],
  },
];
