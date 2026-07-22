import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: { default: "Mobile Hub — Find your next phone", template: "%s — Mobile Hub" },
  description: "Browse verified smartphones, compare specifications, and find your perfect device at Mobile Hub.",
  openGraph: { title: "Mobile Hub", description: "Better phones. Clearer choices.", type: "website" },
};

export default function RootLayout({ children }) { return <html lang="en"><body suppressHydrationWarning><Toaster position="top-right" toastOptions={{ style: { borderRadius: 12, fontSize: 13 } }}/>{children}</body></html>; }
