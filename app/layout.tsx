import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";

export const metadata = {
  title: "TruyenM Admin",
  robots: {
    index: false,
    follow: false
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Toaster richColors position="top-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
