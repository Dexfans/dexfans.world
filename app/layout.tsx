import "./globals.css";

export const metadata = {
  title: "DexFans.world",
  description: "The creator social platform built for Web3."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
