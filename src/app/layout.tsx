import type { Metadata } from "next";
import "./globals.css";
import "./v2.css";
import "./v3.css";
import "./v4.css";
import "./v5.css";
import "./v5-trust.css";
import "./v6.css";
import "./auth.css";
import "./admin.css";
import "./location.css";

export const metadata: Metadata = {
  title: "SocioX AI | Civic intelligence",
  description: "Report. Verify. Resolve. Transform your community.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
