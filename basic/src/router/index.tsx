import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { HomePage } from '../pages/HomePage';
import { ProfilePage } from '../pages/ProfilePage';
import { LivePage } from '../pages/LivePage';
import { MessagesPage } from '../pages/MessagesPage';
import { CreditsPage } from '../pages/CreditsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ExplorePage } from '../pages/ExplorePage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AuthPage } from '../pages/AuthPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />, // Protège toutes les routes enfants
    children: [
      {
        element: <AppLayout />,  // Sidebar + Header + ChatSidebar persistent
        children: [
          { index: true,           element: <HomePage /> },
          { path: 'profile/:username', element: <ProfilePage /> },
          { path: 'explore',       element: <ExplorePage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'settings',      element: <SettingsPage /> },
          { path: 'live/:id',      element: <LivePage /> },
          { path: 'messages',      element: <MessagesPage /> },
          { path: 'messages/:userId', element: <MessagesPage /> },
          { path: 'credits',       element: <CreditsPage /> },
          { path: '*',             element: <NotFoundPage /> },
        ],
      }
    ],
  },
  // Route publique — sans AppLayout
  { path: 'login', element: <AuthPage /> },
]);

export const AppRouter = () => <RouterProvider router={router} />;
