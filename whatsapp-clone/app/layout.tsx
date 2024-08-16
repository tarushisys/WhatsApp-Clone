import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Whatsapp Clone",
  description: "Send instant messages!",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <SignedOut>{/* <SignInButton /> */}</SignedOut>
          <SignedIn>
          </SignedIn>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
