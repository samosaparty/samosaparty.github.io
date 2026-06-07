import './globals.css';

export const metadata = {
  title: 'Admin Analysis Dashboard',
  description: 'Corporate Admin Panel backed by Google Sheets',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
