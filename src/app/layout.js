import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import Toast from '@/components/Toast';

export const metadata = {
  title: 'Gestión Drugstore — Sistema de Gestión',
  description: 'Sistema de gestión para drugstore',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="font-sans">
        <AuthProvider>
          <ToastProvider>
            {children}
            <Toast />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
