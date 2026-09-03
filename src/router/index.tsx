/**
 * Main router configuration
 */

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout/AppLayout'
import { RequireAuth } from '@/components/RequireAuth/RequireAuth'
import { HomePage } from '@/pages/HomePage/HomePage'
import { EmployeesPage } from '@/pages/EmployeesPage/EmployeesPage'
import { EmployeeProfilePage } from '@/pages/EmployeeProfilePage/EmployeeProfilePage'
import { EmployeeOrganisationPage } from '@/pages/EmployeeOrganisationPage/EmployeeOrganisationPage'
import { ErrorPage } from '@/pages/ErrorPage/ErrorPage'
import { LoginPage } from '@/pages/LoginPage/LoginPage'
import { ConsumeMagicLinkPage } from '@/pages/ConsumeMagicLinkPage/ConsumeMagicLinkPage'

const router = createBrowserRouter([
  // Standalone error page (rendered outside the main layout)
  {
    path: '/app-error',
    element: <ErrorPage />,
  },

  // Public auth routes — no session required, rendered outside AppLayout.
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    // Path is fixed by the backend: the magic-link email points at
    // `${APP_BASE_URL}/auth/magic-link/consume?token=…`.
    path: '/auth/magic-link/consume',
    element: <ConsumeMagicLinkPage />,
  },

  // Authenticated application shell.
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'employees',
            element: <EmployeesPage />,
          },
          {
            path: 'employees/:id',
            element: <EmployeeProfilePage />,
          },
          {
            path: 'employees/:id/organisation',
            element: <EmployeeOrganisationPage />,
          },
        ],
      },
    ],
  },

  // Catch-all: bounce to `/`, which itself redirects to `/login` when unauthed.
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export const Router = () => {
  return <RouterProvider router={router} />
}
