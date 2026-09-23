import { handlers } from '@/auth'

/**
 * The OAuth endpoints: /api/auth/signin, /callback/:provider, /signout, /session.
 *
 * Note for the Google Cloud console: the authorised redirect URI is
 * <origin>/api/auth/callback/google, which means both
 * http://localhost:3000/api/auth/callback/google and the production origin have
 * to be registered. Same shape for github.
 */
export const { GET, POST } = handlers
