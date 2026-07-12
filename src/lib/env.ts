const REQUIRED_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const OPTIONAL_VARS = [
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export function validateEnv(): string[] {
  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  return missing;
}

export function getEnvStatus(): { valid: boolean; missing: string[] } {
  const missing = validateEnv();
  return { valid: missing.length === 0, missing };
}
