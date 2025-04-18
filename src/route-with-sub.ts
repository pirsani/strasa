// "use server";
export interface RouteItem {
  name: string;
  title: string;
  href: string;
  // icon: LucideIcon;
  iconName: string; // for iconify
  order?: number;
  counter?: number;
  permissions?: string[];
  displayAsMenu?: boolean;
  cascadePermissions?: boolean; // cascade permissions to sub routes
  resources?: string[];
  subs?: RouteItem[]; // sub routes
}

export const DEFAULT_ROUTE_AFTER_LOGIN = "/dashboard";

export const loginRoutes: RouteItem[] = [
  {
    name: "login",
    title: "Login",
    href: "/login",
    iconName: "key",
    // icon: Key,
    order: 2,
    displayAsMenu: false,
  },
  {
    name: "login",
    title: "Login",
    href: "/",
    iconName: "key",
    // icon: Key,
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
    iconName: "book-open",
    //icon: BookOpen,
    order: 2,
    displayAsMenu: false,
  },
  {
    name: "login",
    title: "Login",
    href: "/login",
    iconName: "key",
    // icon: Key,
    order: 2,
    displayAsMenu: false,
  },
  {
    name: "reset-password",
    title: "Reset Password",
    href: "/reset-password",
    iconName: "square-asterisk",
    // icon: SquareAsterisk,
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
    iconName: "gauge",
    // icon: Gauge,
    order: 0,
    displayAsMenu: true,
  },
  {
    name: "workbench",
    title: "Workbench",
    href: "/workbench",
    iconName: "square-activity",
    // icon: SquareActivity,
    order: 1,
    displayAsMenu: true,
    resources: ["workbench"],
  },
  {
    name: "pending",
    title: "Pending Matters",
    href: "/pending",
    iconName: "monitor-pause",
    // icon: MonitorPause,
    order: 1,
    displayAsMenu: true,
    resources: ["pending"],
  },
];

export const alurProsesRoutes: RouteItem[] = [
  {
    name: "setup-kegiatan",
    title: "0. Setup kegiatan",
    href: "/setup-kegiatan",
    iconName: "settings-2",
    // icon: Settings2,
    order: 0,
    displayAsMenu: true,
    resources: ["proses-setup-kegiatan"],
  },
  {
    name: "pengajuan-kegiatan",
    title: "1. Pengajuan",
    href: "/pengajuan",
    iconName: "milestone",
    // icon: Milestone,
    order: 1,
    displayAsMenu: true,
    resources: ["proses-pengajuan"],
  },
  {
    name: "verifikasi-kegiatan",
    title: "2. verifikasi",
    href: "/verifikasi",
    iconName: "list-checks",
    // icon: ListChecks,
    order: 2,
    displayAsMenu: true,
    resources: ["proses-verifikasi"],
  },
  {
    name: "daftar-nominatif",
    title: "3. Daftar Nominatif",
    href: "/daftar-nominatif",
    iconName: "table",
    // icon: Table,
    order: 3,
    displayAsMenu: true,
    resources: ["proses-daftar-nominatif"],
  },
  {
    name: "pembayaran-kegiatan",
    title: "4. Pembayaran",
    href: "/pembayaran",
    iconName: "credit-card",
    // icon: CreditCard,
    order: 4,
    displayAsMenu: true,
    resources: ["proses-pembayaran"],
  },
];

export const dataReferensiRoutesWithSub: RouteItem[] = [
  {
    name: "Kegiatan",
    title: "Kegiatan",
    href: "#",
    iconName: "settings-2",
    // icon: Settings2,
    order: 0,
    displayAsMenu: true,
    subs: [
      {
        name: "referensi-narasumber",
        title: "Narasumber",
        href: "/data-referensi/narasumber",
        iconName: "graduation-cap",
        // icon: GraduationCap,
        order: 0,
        displayAsMenu: true,
        resources: ["ref-narasumber", "referensi"],
      },
      {
        name: "referensi-materi",
        title: "Materi",
        href: "/data-referensi/materi",
        iconName: "book-open",
        // icon: BookOpen,
        order: 0,
        displayAsMenu: true,
        resources: ["ref-materi", "referensi"],
      },
      {
        name: "referensi-kelas",
        title: "Kelas",
        href: "/data-referensi/kelas",
        iconName: "grid",
        // icon: Grid,
        order: 0,
        displayAsMenu: true,
        resources: ["ref-kelas", "referensi"],
      },
    ],
  },
  {
    name: "SBM",
    title: "SBM",
    href: "#",
    iconName: "banknote",
    // icon: Banknote,
    order: 1,
    displayAsMenu: true,
    subs: [
      {
        name: "referensi-sbm-honorarium",
        title: "SBM Honorarium",
        href: "/data-referensi/sbm/honorarium",
        iconName: "banknote",
        // icon: Banknote,
        order: 1,
        displayAsMenu: true,
        resources: ["ref-sbm-honorarium", "referensi"],
      },
      {
        name: "referensi-sbm-uh-dalam-negeri",
        title: "SBM UH Dalam Negeri",
        href: "/data-referensi/sbm/uh-dalam-negeri",
        iconName: "banknote",
        // icon: Banknote,
        order: 2,
        displayAsMenu: true,
        resources: ["ref-sbm-uh-dalam-negeri", "referensi"],
      },
      {
        name: "referensi-sbm-uh-luar-negeri",
        title: "SBM UH Luar Negeri",
        href: "/data-referensi/sbm/uh-luar-negeri",
        iconName: "banknote",
        // icon: Banknote,
        order: 3,
        displayAsMenu: true,
        resources: ["ref-sbm-uh-luar-negeri", "referensi"],
      },
      {
        name: "referensi-sbm-uang-representasi",
        title: "SBM Uang Representasi",
        href: "/data-referensi/sbm/uang-representasi",
        iconName: "banknote",
        // icon: Banknote,
        order: 4,
        displayAsMenu: true,
        resources: ["ref-sbm-uang-representasi", "referensi"],
      },
      {
        name: "referensi-sbm-transpor",
        title: "SBM Transpor",
        href: "/data-referensi/sbm/transpor",
        iconName: "banknote",
        // icon: Banknote,
        order: 4,
        displayAsMenu: true,
        resources: ["ref-sbm-transpor", "referensi"],
      },
    ],
  },
  {
    name: "General",
    title: "General",
    href: "#",
    iconName: "settings-2",
    // icon: Settings2,
    order: 0,
    displayAsMenu: true,
    subs: [
      {
        name: "referensi-kro",
        title: "KRO",
        href: "/data-referensi/kro",
        iconName: "list-tree",
        // icon: Wallet,
        order: 110,
        resources: ["ref-kro", "referensi"],
      },
      {
        name: "referensi-pagu",
        title: "Pagu",
        href: "/data-referensi/pagu",
        iconName: "wallet",
        // icon: Wallet,
        order: 110,
        resources: ["ref-pagu", "referensi"],
      },
      {
        name: "referensi-sp2d",
        title: "SP2D",
        href: "/data-referensi/sp2d",
        iconName: "file-badge",
        // icon: FileBadge,
        order: 110,
        displayAsMenu: true,
        resources: ["ref-sp2d", "referensi"],
      },
      {
        name: "referensi-negara",
        title: "Negara",
        href: "/data-referensi/negara",
        iconName: "flag",
        // icon: Flag,
        order: 120,
        displayAsMenu: true,
        resources: ["ref-negara", "referensi"],
      },
      {
        name: "referensi-provinsi",
        title: "Provinsi",
        href: "/data-referensi/provinsi",
        iconName: "map-pinned",
        // icon: MapPinned,
        order: 130,
        displayAsMenu: true,
        resources: ["ref-provinsi", "referensi"],
      },
    ],
  },
  {
    name: "Users",
    title: "Users",
    href: "#",
    iconName: "user-cog",
    // icon: UserCog,
    order: 4,
    displayAsMenu: true,
    subs: [
      {
        name: "referensi-unit-kerja",
        title: "Unit Kerja",
        href: "/data-referensi/unit-kerja",
        iconName: "brick-wall",
        // icon: BrickWall,
        order: 90,
        resources: ["ref-unit-kerja", "referensi"],
      },
      {
        name: "referensi-satker",
        title: "Satker Anggaran",
        href: "/data-referensi/satker-anggaran",
        iconName: "brick-wall",
        // icon: BrickWall,
        order: 95,
        resources: ["ref-satker-anggaran", "referensi"],
      },
      {
        name: "referensi-pejabat-perbendaharaan",
        title: "Pengelola Keuangan",
        href: "/data-referensi/pejabat-perbendaharaan",
        iconName: "signature",
        // icon: Signature,
        order: 97,
        displayAsMenu: true,
        resources: [
          "ref-pejabat-perbendaharaan",
          "referensi",
          "ref-pengelola-keuangan",
        ],
      },

      {
        name: "referensi-role",
        title: "Role",
        href: "/data-referensi/role",
        iconName: "user-cog",
        // icon: UserCog,
        order: 140,
        displayAsMenu: true,
        resources: ["ref-role"],
      },
      {
        name: "referensi-pengguna",
        title: "Pengguna",
        href: "/data-referensi/pengguna",
        iconName: "users",
        // icon: Users,
        order: 150,
        displayAsMenu: true,
        resources: ["ref-pengguna"],
      },
    ],
  },
];

export const dataReferensiRoutes: RouteItem[] = [];
