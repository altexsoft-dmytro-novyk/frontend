/**
 * Main router configuration
 */

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout/AppLayout'
import { RequireAuth } from '@/components/RequireAuth/RequireAuth'
import { HomePage } from '@/pages/HomePage/HomePage'
import { EmployeesPage } from '@/pages/EmployeesPage/EmployeesPage'
import { EmployeeImportPage } from '@/pages/EmployeeImportPage/EmployeeImportPage'
import { EmployeeProfilePage } from '@/pages/EmployeeProfilePage/EmployeeProfilePage'
import { EmployeeOrganisationPage } from '@/pages/EmployeeOrganisationPage/EmployeeOrganisationPage'
import { EmployeeDeparturePage } from '@/pages/EmployeeDeparturePage/EmployeeDeparturePage'
import { DashboardsPage } from '@/pages/DashboardsPage/DashboardsPage'
import { LoginPage } from '@/pages/LoginPage/LoginPage'
import { ErrorPage } from '@/pages/ErrorPage/ErrorPage'
import { ConsumeMagicLinkPage } from '@/pages/ConsumeMagicLinkPage/ConsumeMagicLinkPage'

const router = createBrowserRouter([
  // Standalone login page
  {
    path: '/login',
    element: <LoginPage />,
  },

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
            // Static segment — React Router ranks it above `employees/:id`
            // regardless of declaration order; kept first and adjacent for clarity.
            path: 'employees/import',
            element: <EmployeeImportPage />,
          },
          {
            path: 'employees/:id',
            element: <EmployeeProfilePage />,
          },
          {
            path: 'employees/:id/organisation',
            element: <EmployeeOrganisationPage />,
          },
          {
            path: 'employees/:id/departure',
            element: <EmployeeDeparturePage />,
          },
        ],
      },
      {
        path: 'dashboards',
        element: <DashboardsPage />,
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
