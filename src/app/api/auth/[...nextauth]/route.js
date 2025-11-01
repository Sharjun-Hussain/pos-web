// pages/api/auth/[...nextauth].js (or app/api/auth/[...nextauth]/route.ts)
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// The expiry time from your API (in seconds)
const LARAVEL_TOKEN_EXPIRES_IN = 3600; // 3600 seconds = 1 hour

export const authOptions = {
  session: {
    // Use JWTs for sessions
    strategy: "jwt",
    
    // **CRITICAL:** Set the session maxAge to match your token's expiry
    // This will force the user to re-authenticate when the token expires.
    // This is the simplest strategy without a refresh token.
    maxAge: LARAVEL_TOKEN_EXPIRES_IN, // 1 hour
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // Call your Laravel API
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const responseData = await res.json();

        // 1. Check for API-level success (based on *your* JSON)
        if (responseData.status !== "success" || !res.ok) {
          console.error("Failed to login:", responseData.message);
          // Return null to reject the login
          return null;
        }

        // 2. Extract the data we need from your nested structure
        const user = responseData.data.user;
        const token = responseData.data.auth_token;

        // 3. Return the object NextAuth.js needs.
        // This object is passed to the `jwt` callback.
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          profileImage: user.profile_image, // We can store this too!
          accessToken: token, // This is your Bearer token
        };
      },
    }),
  ],

  // 4. Configure Callbacks
  callbacks: {
    /**
     * @param  {object}  token     Decrypted JSON Web Token
     * @param  {object}  user      The object returned from the `authorize` function
     */
    async jwt({ token, user }) {
      // `user` is only available on the initial sign-in
      if (user) {
        token.accessToken = user.accessToken;
        token.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.profileImage,
        };
      }
      return token;
    },

    /**
     * @param  {object}  session   Session object
     * @param  {object}  token     Decrypted JSON Web Token (from `jwt` callback)
     */
    async session({ session, token }) {
      // Pass the access token and user info to the client-side session
      session.accessToken = token.accessToken;
      session.user = token.user;
      console.log(session);
      
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

// Export the handler for both GET and POST requests
export { handler as GET, handler as POST };