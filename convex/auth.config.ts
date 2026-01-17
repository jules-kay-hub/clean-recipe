// convex/auth.config.ts
// Clerk authentication provider configuration for Convex

export default {
  providers: [
    {
      domain: process.env.CLERK_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
