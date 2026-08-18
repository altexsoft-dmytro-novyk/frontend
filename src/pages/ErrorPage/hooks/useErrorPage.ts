/**
 * Business logic for ErrorPage
 */

import { useLocation } from 'react-router-dom'

interface ErrorPageState {
  error?: string
}

export const useErrorPage = () => {
  const location = useLocation()
  const state = location.state as ErrorPageState

  const handleReload = () => {
    window.location.assign('/')
  }

  return {
    error: state?.error,
    handleReload,
  }
}
