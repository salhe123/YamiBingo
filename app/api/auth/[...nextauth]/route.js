import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/libs/prismadb";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            cashiers: {
              include: {  
                shop: {
                  include: {
                    wallet: true, 
                    owner: true,
                  },
                },
              },
            },
            floorGuys: {
              include: {
                shop: {
                  include: {
                    wallet: true,
                    owner: true,
                  },
                },
              },
            },
            shops: {
              include: { wallet: true }, 
            },
          },
        });

        if (!user) {
          throw new Error("No user found with this email.");
        }

        if (!(await bcrypt.compare(credentials.password, user.password))) {
          throw new Error("Invalid email or password. Please try again.");
        }

        if (
          user.isBlocked ||
          (user.role === "Cashier" && user.cashiers[0]?.isBlocked) ||
          (user.role === "FloorGuy" && user.floorGuys[0]?.isBlocked)
        ) {
          throw new Error(
            "Your account has been blocked. Contact the admin for more information."
          );
        }

        let additionalData = {};

        if (user.role === "Cashier") {
          const cashier = user.cashiers[0];
          if (cashier) {
            const shopWalletBalance = cashier.shop.wallet
              ? cashier.shop.wallet.balance
              : 0; // Use ShopWallet balance
            additionalData = {
              cashierId: cashier.id,
              shopId: cashier.shop.id,
              shopName: cashier.shop.shopName,
              isBlocked: cashier.isBlocked,
              userIsBlocked: user.isBlocked,
              ownerId: cashier.shop.ownerId,
              shopWalletBalance, // Replace adminWalletBalance with shopWalletBalance
            };
          }
        } else if (user.role === "FloorGuy") {
          const floorGuy = user.floorGuys[0];
          if (floorGuy?.shop) {
            additionalData = {
              floorGuyId: floorGuy.id,
              shopId: floorGuy.shop.id,
              shopName: floorGuy.shop.shopName,
              isBlocked: floorGuy.isBlocked,
              userIsBlocked: user.isBlocked,
              ownerId: floorGuy.shop.ownerId,
            };
          } else if (floorGuy) {
            additionalData = {
              floorGuyId: floorGuy.id,
              isBlocked: floorGuy.isBlocked,
              userIsBlocked: user.isBlocked,
            };
          }
        } else if (user.role === "Admin") {
          const shopWalletBalance = user.shops[0]?.wallet
            ? user.shops[0].wallet.balance
            : 0; // Use first shop's wallet balance for Admin
          additionalData = {
            shopWalletBalance, // Replace adminWalletBalance with shopWalletBalance
            isBlocked: user.isBlocked,
            shopId: user.shops[0]?.id,
            shopName: user.shops[0]?.shopName,
          };
        } else if (user.role === "Agent") {
          // Add Agent-specific data if needed
          additionalData = {
            isBlocked: user.isBlocked,
            // Add more agent-specific fields here if needed
          };
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          isBlocked: user.isBlocked,
          ...additionalData,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isBlocked = token.isBlocked;

        if (token.shopId) {
          session.user.shopId = token.shopId;
          session.user.shopName = token.shopName;
          session.user.ownerId = token.ownerId;
        }

        if (token.shopWalletBalance) {
          session.user.shopWalletBalance = token.shopWalletBalance; // Replace adminWalletBalance with shopWalletBalance
        }

        if (token.cashierId) {
          session.user.cashierId = token.cashierId;
        }

        if (token.floorGuyId) {
          session.user.floorGuyId = token.floorGuyId;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isBlocked = user.isBlocked;

        if (user.shopId) {
          token.shopId = user.shopId;
          token.shopName = user.shopName;
          token.ownerId = user.ownerId;
        }

        if (user.shopWalletBalance) {
          token.shopWalletBalance = user.shopWalletBalance; // Replace adminWalletBalance with shopWalletBalance
        }

        if (user.cashierId) {
          token.cashierId = user.cashierId;
        }

        if (user.floorGuyId) {
          token.floorGuyId = user.floorGuyId;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
