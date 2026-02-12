import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppThemeProvider } from './contexts';
import { AppRoutes } from './routes';
import './components/forms/TraducoesYup';
import { SnackbarProvider } from './contexts/SnackBarProvider';
import { SocketProvider } from './contexts/SocketProvider';
import { Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loading } from './pages/Loading';
import { AccessDenied } from './pages/AccessDenied';

/**
 * Componente que protege as rotas exigindo autenticação via token do Corpo Bueno
 */
const ProtectedRoutes = () => {
  const { isAuthenticated, isLoading, error } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated || error) {
    return <AccessDenied message={error || undefined} />;
  }

  return (
    <SocketProvider>
      <AppRoutes />
    </SocketProvider>
  );
};

const App = () => {
  return (
    <AppThemeProvider>
      <SnackbarProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/*" element={<ProtectedRoutes />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </SnackbarProvider>
    </AppThemeProvider>
  )
}

export default App;
