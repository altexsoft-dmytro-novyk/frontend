/**
 * Main router configuration
 */

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout/AppLayout'
import { HomePage } from '@/pages/HomePage/HomePage'
import { ErrorPage } from '@/pages/ErrorPage/ErrorPage'

const router = createBrowserRouter([
  // Standalone error page (rendered outside the main layout)
  {
    path: '/app-error',
    element: <ErrorPage />,
  },

  // Application routes wrapped in the main layout
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },

  // Catch-all route
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export const Router = () => {
  return <RouterProvider router={router} />
}
