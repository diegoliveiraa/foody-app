import type { MeModule, MeResponse, ScreenAction } from "../../src/@types/me";

export const ME_LABELS = {
  STORE: "Loja",
  MENU: "Cardápio",
  MY_ORDERS: "Pedidos",
  DASHBOARD: "Dashboard",
  OVERVIEW: "Visão geral",
  ORDERS: "Pedidos",
  ORDER_LIST: "Pedidos",
  CATALOG: "Catálogo",
  PRODUCTS: "Produtos",
  CATEGORIES: "Categorias",
  ADMIN: "Administração",
  USERS: "Usuários",
} as const;

const STORE_MODULE: MeModule = {
  key: "store",
  label: ME_LABELS.STORE,
  screens: [
    { key: "store.menu", label: ME_LABELS.MENU, actions: ["PLACE_ORDER"] },
    {
      key: "store.my-orders",
      label: ME_LABELS.MY_ORDERS,
      actions: ["CANCEL", "REQUEST_CANCELLATION"],
    },
  ],
};

const STAFF_MODULES: MeModule[] = [
  {
    key: "dashboard",
    label: ME_LABELS.DASHBOARD,
    screens: [{ key: "dashboard.overview", label: ME_LABELS.OVERVIEW, actions: [] }],
  },
  {
    key: "orders",
    label: ME_LABELS.ORDERS,
    screens: [
      {
        key: "orders.order-list",
        label: ME_LABELS.ORDER_LIST,
        actions: ["UPDATE_STATUS", "CANCEL", "DECIDE_CANCELLATION"],
      },
    ],
  },
  {
    key: "catalog",
    label: ME_LABELS.CATALOG,
    screens: [
      {
        key: "catalog.products",
        label: ME_LABELS.PRODUCTS,
        actions: ["CREATE", "UPDATE", "DISABLE", "DELETE"],
      },
      {
        key: "catalog.categories",
        label: ME_LABELS.CATEGORIES,
        actions: ["CREATE", "UPDATE", "DISABLE", "DELETE"],
      },
    ],
  },
];

function adminModule(userActions: ScreenAction[]): MeModule {
  return {
    key: "admin",
    label: ME_LABELS.ADMIN,
    screens: [{ key: "admin.users", label: ME_LABELS.USERS, actions: userActions }],
  };
}

export const CUSTOMER_ME: MeResponse = {
  user: { id: "0199f2a0-0000-7000-8000-000000000001", name: "Ana Souza", email: "ana@foody.dev" },
  modules: [STORE_MODULE],
};

export const STAFF_ME: MeResponse = {
  user: {
    id: "0199f2a0-0000-7000-8000-000000000002",
    name: "Bruno Lima",
    email: "bruno@foody.dev",
  },
  modules: STAFF_MODULES,
};

export function adminMeWithUserActions(userActions: ScreenAction[]): MeResponse {
  return {
    user: {
      id: "0199f2a0-0000-7000-8000-000000000003",
      name: "Carla Mendes",
      email: "carla@foody.dev",
    },
    modules: [...STAFF_MODULES, adminModule(userActions)],
  };
}

export const ADMIN_ME: MeResponse = adminMeWithUserActions(["UPDATE", "DISABLE"]);
