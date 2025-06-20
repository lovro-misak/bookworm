import NotificationWrapper from "@/components/ui/NotificationWrapper";
import "./globals.css";
import ReactQueryProvider from "@/components/ui/ReactQueryProvider";

export const metadata = {
  title: "Bookworm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ReactQueryProvider>
          <NotificationWrapper>{children}</NotificationWrapper>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
