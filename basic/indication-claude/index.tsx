import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { AuthPage } from '../pages/AuthPage';
import { HomePage } from '../pages/HomePage';
import { ProfilePage } from '../pages/ProfilePage';
import { LivePage } from '../pages/LivePage';
import { MessagesPage } from '../pages/MessagesPage';
import { CreditsPage } from '../pages/CreditsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ExplorePage } from '../pages/ExplorePage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { SettingsPage } from '../pages/SettingsPage';

const router = createBrowserRouter([
  // ── Routes publiques (sans Sidebar/Header) ──
  { path: '/login', element: <AuthPage /> },

  // ── Routes app (avec AppLayout) ──
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,               element: <HomePage /> },
      { path: 'profile/:username', element: <ProfilePage /> },
      { path: 'explore',           element: <ExplorePage /> },
      { path: 'notifications',     element: <NotificationsPage /> },
      { path: 'settings',          element: <SettingsPage /> },
      { path: 'live/:id',          element: <LivePage /> },
      { path: 'messages',          element: <MessagesPage /> },
      { path: 'messages/:userId',  element: <MessagesPage /> },
      { path: 'credits',           element: <CreditsPage /> },
      { path: '*',                 element: <NotFoundPage /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
