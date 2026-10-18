export const SEED_VARIABLES = {
  CUSTOMER_EMAIL: "SEED_CUSTOMER_EMAIL",
  STAFF_EMAIL: "SEED_STAFF_EMAIL",
  PASSWORD: "SEED_DEFAULT_PASSWORD",
  ADMIN_EMAIL: "SEED_ADMIN_EMAIL",
  ADMIN_PASSWORD: "SEED_ADMIN_PASSWORD",
} as const;

type SeedVariable = (typeof SEED_VARIABLES)[keyof typeof SEED_VARIABLES];

export interface SeedAccounts {
  customerEmail: string;
  staffEmail: string;
  password: string;
  adminEmail: string;
  adminPassword: string;
}

const DEMO_PASSWORD: string = "Foody#2026";

const DEMO_ACCOUNTS: Record<SeedVariable, string> = {
  [SEED_VARIABLES.CUSTOMER_EMAIL]: "cliente@foody.local",
  [SEED_VARIABLES.STAFF_EMAIL]: "equipe@foody.local",
  [SEED_VARIABLES.PASSWORD]: DEMO_PASSWORD,
  [SEED_VARIABLES.ADMIN_EMAIL]: "admin@foody.local",
  [SEED_VARIABLES.ADMIN_PASSWORD]: DEMO_PASSWORD,
};

function readVariable(name: SeedVariable): string {
  const value: string = process.env[name] ?? "";
  return value.trim() === "" ? DEMO_ACCOUNTS[name] : value;
}

export function readSeedAccounts(): SeedAccounts {
  return {
    customerEmail: readVariable(SEED_VARIABLES.CUSTOMER_EMAIL),
    staffEmail: readVariable(SEED_VARIABLES.STAFF_EMAIL),
    password: readVariable(SEED_VARIABLES.PASSWORD),
    adminEmail: readVariable(SEED_VARIABLES.ADMIN_EMAIL),
    adminPassword: readVariable(SEED_VARIABLES.ADMIN_PASSWORD),
  };
}
