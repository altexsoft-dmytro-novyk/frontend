/**
 * Main router configuration
 */

import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout/AppLayout'
import { RequireAuth } from '@/components/RequireAuth/RequireAuth'
import { ErrorPage } from '@/pages/ErrorPage/ErrorPage'
import { LoginPage } from '@/pages/LoginPage/LoginPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage/AuthCallbackPage'
import { PeoplePage } from '@/pages/PeoplePage/PeoplePage'
import { PersonProfilePage } from '@/pages/PersonProfilePage/PersonProfilePage'
import { RolesPage } from '@/pages/RolesPage/RolesPage'
import { MeRedirect } from '@/pages/MeRedirect/MeRedirect'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  { path: '/app-error', element: <ErrorPage /> },

  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/people" replace /> },
      { path: 'people', element: <PeoplePage /> },
      { path: 'people/:id', element: <PersonProfilePage /> },
      { path: 'me', element: <MeRedirect /> },
      { path: 'admin/roles', element: <RolesPage /> },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
])

export const Router = () => {
  return <RouterProvider router={router} />
}
