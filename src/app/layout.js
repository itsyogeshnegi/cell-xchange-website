import { Playwrite_NZ_Basic } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const playwrite = Playwrite_NZ_Basic({
  adjustFontFallback: false,
  display: "swap",
  variable: "--font-playwrite-nz-basic",
  weight: "variable",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: { default: "cell.xchange — Smartphones in Vasant Kunj", template: "%s — cell.xchange" },
  description: "Browse verified smartphones and visit cell.xchange in Kishan Garh, Vasant Kunj. Open all seven days, 12 p.m. to 10 p.m.",
  openGraph: { title: "cell.xchange", description: "The right phone. No sales noise.", type: "website" },
};

export default function RootLayout({ children }) { return <html lang="en" className={playwrite.variable}><body suppressHydrationWarning><Toaster position="top-right" toastOptions={{ style: { borderRadius: 12, fontSize: 13 } }}/>{children}</body></html>; }
