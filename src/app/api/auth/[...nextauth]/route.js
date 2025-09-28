// app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // This is the core logic where you verify the user
      async authorize(credentials, req) {
        // IMPORTANT: Add your own database logic here
        // 1. Find the user in your database (e.g., Prisma, MongoDB, etc.)
        // const user = await db.user.findUnique({ where: { email: credentials.email } });

        // For demonstration, we'll use a mock user
        const mockUser = {
          id: '1',
          email: 'admin@system.com',
          password: 'password123', // In a real app, this would be a hashed password
          name: 'Admin User',
        };

        // 2. Check if user exists and if the password is correct
        // In a real app, you would use a library like `bcrypt` to compare hashes
        if (credentials.email === mockUser.email && credentials.password === mockUser.password) {
          // 3. Return the user object (without the password) on success
          return { id: mockUser.id, name: mockUser.name, email: mockUser.email };
        }

        // Return null if user data could not be validated
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Use JSON Web Tokens for session management
  },
  pages: {
    signIn: '/login', // Redirect users to your custom login page
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };