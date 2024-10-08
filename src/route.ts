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
}

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
  },
  {
    name: "pengajuan-kegiatan",
    title: "1. Pengajuan",
    href: "/pengajuan",
    icon: "milestone",
    order: 1,
    displayAsMenu: true,
  },
  {
    name: "verifikasi-kegiatan",
    title: "2. verifikasi",
    href: "/verifikasi",
    icon: "list-checks",
    order: 2,
    displayAsMenu: true,
  },
  {
    name: "daftar-nominatif",
    title: "3. Daftar Nominatif",
    href: "/daftar-nominatif",
    icon: "table",
    order: 3,
    displayAsMenu: true,
  },
  {
    name: "pembayaran-kegiatan",
    title: "4. Pembayaran",
    href: "/pembayaran",
    icon: "credit-card",
    order: 4,
    displayAsMenu: true,
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
  },
  {
    name: "referensi-materi",
    title: "Materi",
    href: "/data-referensi/materi",
    icon: "book-open",
    order: 0,
    displayAsMenu: true,
  },
  {
    name: "referensi-kelas",
    title: "Kelas",
    href: "/data-referensi/kelas",
    icon: "grid",
    order: 0,
    displayAsMenu: true,
  },
  {
    name: "referensi-sbm-honorarium",
    title: "SBM Honorarium",
    href: "/data-referensi/sbm/honorarium",
    icon: "banknote",
    order: 1,
    displayAsMenu: true,
  },
  {
    name: "referensi-sbm-uh-dalam-negeri",
    title: "SBM UH Dalam Negeri",
    href: "/data-referensi/sbm/uh-dalam-negeri",
    icon: "banknote",
    order: 2,
    displayAsMenu: true,
  },
  {
    name: "referensi-sbm-uh-luar-negeri",
    title: "SBM UH Luar Negeri",
    href: "/data-referensi/sbm/uh-luar-negeri",
    icon: "banknote",
    order: 3,
    displayAsMenu: true,
  },
  {
    name: "referensi-sbm-uang-representasi",
    title: "SBM Uang Representasi",
    href: "/data-referensi/sbm/uang-representasi",
    icon: "banknote",
    order: 4,
    displayAsMenu: true,
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
  },
  {
    name: "referensi-pejabat-perbendaharaan",
    title: "Pengelola Keuangan",
    href: "/data-referensi/pejabat-perbendaharaan",
    icon: "signature",
    order: 6,
    displayAsMenu: true,
  },
  {
    name: "referensi-role",
    title: "Role",
    href: "/data-referensi/role",
    icon: "user-cog",
    order: 7,
    displayAsMenu: true,
  },
  {
    name: "referensi-pengguna",
    title: "Pengguna",
    href: "/data-referensi/pengguna",
    icon: "users",
    order: 8,
    displayAsMenu: true,
  },
  {
    name: "referensi-satker",
    title: "Satker Anggaran",
    href: "/data-referensi/satker-anggaran",
    icon: "brick-wall",
    order: 9,
  },
  {
    name: "referensi-unit-kerja",
    title: "Unit Kerja",
    href: "/data-referensi/unit-kerja",
    icon: "brick-wall",
    order: 9,
  },
  {
    name: "referensi-sp2d",
    title: "SP2D",
    href: "/data-referensi/sp2d",
    icon: "file-badge",
    order: 10,
    displayAsMenu: true,
  },
  {
    name: "referensi-negara",
    title: "Negara",
    href: "/data-referensi/negara",
    icon: "flag",
    order: 11,
    displayAsMenu: true,
  },
  {
    name: "referensi-provinsi",
    title: "Provinsi",
    href: "/data-referensi/provinsi",
    icon: "map-pinned",
    order: 12,
    displayAsMenu: true,
  },
];
