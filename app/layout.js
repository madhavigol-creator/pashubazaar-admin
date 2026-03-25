import './globals.css';
import { AuthProvider } from '../lib/AuthContext';
 
export const metadata = {
  title: 'PashuBazaar Admin',
  description: "Admin panel for PashuBazaar - India's #1 Animal Marketplace",
};
 
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
