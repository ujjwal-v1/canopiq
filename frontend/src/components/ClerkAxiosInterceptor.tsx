import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useAuth } from '@clerk/react'
import { configureAuth } from '../services/api'

export function ClerkAxiosInterceptor({ children }: { children: ReactNode }) {
  const { getToken } = useAuth()
  useEffect(() => { configureAuth(getToken) }, [getToken])
  return <>{children}</>
}
