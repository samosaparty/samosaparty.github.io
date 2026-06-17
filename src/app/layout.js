import './globals.css';

export const metadata = {
  title: 'Samosa Party Dashboard',
  description: 'Analysis dashboard for administrative purposes',
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
