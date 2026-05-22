// Server-side helper that reports which auth providers are configured in the
// current environment. Used by the signin/signup pages to hide tabs that would
// otherwise lead to a dead provider — important locally where only the
// email/password Credentials provider is reachable without secrets.

export type ConfiguredProviders = {
  google: boolean;
  github: boolean;
  phone: boolean;
  emailPassword: true;
};

function hasValue(v: string | undefined): boolean {
  return typeof v === 'string' && v.trim().length > 0;
}

export function getConfiguredProviders(): ConfiguredProviders {
  return {
    google: hasValue(process.env.GOOGLE_CLIENT_ID) && hasValue(process.env.GOOGLE_CLIENT_SECRET),
    github: hasValue(process.env.GITHUB_CLIENT_ID) && hasValue(process.env.GITHUB_CLIENT_SECRET),
    phone:
      hasValue(process.env.TWILIO_ACCOUNT_SID) &&
      hasValue(process.env.TWILIO_AUTH_TOKEN) &&
      hasValue(process.env.TWILIO_VERIFY_SID),
    emailPassword: true,
  };
}
