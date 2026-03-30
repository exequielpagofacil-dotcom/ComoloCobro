import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const metadataBase = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
})();

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "¿Cómo lo cobro?",
    template: "%s | ¿Cómo lo cobro?",
  },
  description:
    "Buscador de guías paso a paso para operadores de PagoFácil. Encontrá cómo cobrar empresas y servicios en segundos.",
  openGraph: {
    title: "¿Cómo lo cobro?",
    description:
      "Guías claras para procesar cobros en PagoFácil con texto, fotos paso a paso y video.",
    type: "website",
    locale: "es_AR",
    siteName: "¿Cómo lo cobro?",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
