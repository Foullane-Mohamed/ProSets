// Auth0 for Next.js App Router
// The SDK automatically reads from environment variables:
// - AUTH0_SECRET
// - AUTH0_BASE_URL  
// - AUTH0_ISSUER_BASE_URL
// - AUTH0_CLIENT_ID
// - AUTH0_CLIENT_SECRET
// - AUTH0_AUDIENCE

// For now, create a simple placeholder
// The actual Auth0 integration is handled in the API routes
export const auth0Config = {
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  audience: process.env.AUTH0_AUDIENCE,
};
