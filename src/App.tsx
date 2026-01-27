import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { routeConfig } from './config/routeConfig.tsx';
import { ThemeProvider } from '@/components/ThemeProvider.tsx';
import { AuthProvider } from '@/context/AuthContext.tsx';
import { Toaster } from '@/components/ui/sonner';

function AppRoutes() {
  const routes = useRoutes(routeConfig);
  return routes;
}

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
