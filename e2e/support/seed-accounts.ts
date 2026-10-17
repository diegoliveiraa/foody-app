export const SEED_VARIABLES = {
  CUSTOMER_EMAIL: "SEED_CUSTOMER_EMAIL",
  STAFF_EMAIL: "SEED_STAFF_EMAIL",
  PASSWORD: "SEED_DEFAULT_PASSWORD",
} as const;

type SeedVariable = (typeof SEED_VARIABLES)[keyof typeof SEED_VARIABLES];

export interface SeedAccounts {
  customerEmail: string;
  staffEmail: string;
  password: string;
}

function missingVariables(): SeedVariable[] {
  return Object.values(SEED_VARIABLES).filter(
    (name: SeedVariable): boolean => (process.env[name] ?? "").trim() === "",
  );
}

export function readSeedAccounts(): SeedAccounts {
  const missing: SeedVariable[] = missingVariables();
  if (missing.length > 0) {
    throw new Error(
      `The integrated suite logs in with the API's seed accounts. Set ${missing.join(", ")} ` +
        "(the same values as ../foody-api/.env), e.g. `set -a; . ../foody-api/.env; set +a`.",
    );
  }
  return {
    customerEmail: process.env[SEED_VARIABLES.CUSTOMER_EMAIL] ?? "",
    staffEmail: process.env[SEED_VARIABLES.STAFF_EMAIL] ?? "",
    password: process.env[SEED_VARIABLES.PASSWORD] ?? "",
  };
}
