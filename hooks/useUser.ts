import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuthUserMetadata {
  email: string
  email_verified: boolean
  full_name: string
  iss: string
  name: string
  phone_verified: boolean
  provider_id: string
  sub: string
}

interface AuthIdentity {
  identity_id: string
  id: string
  user_id: string
  identity_data: AuthUserMetadata
  provider: string
  last_sign_in_at: string
  created_at: string
  updated_at: string
  email: string
}

interface AuthUser {
  id: string
  aud: string
  role: string
  email: string
  email_confirmed_at: string
  phone: string
  confirmed_at: string
  last_sign_in_at: string
  app_metadata: {
    provider: string
    providers: string[]
  }
  user_metadata: AuthUserMetadata
  identities: AuthIdentity[]
  created_at: string
  updated_at: string
  is_anonymous: boolean
}

interface GetUserData {
  user: AuthUser | null
}

export function useUser() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      try {
        const { data, error } = (await supabase.auth.getUser()) as { data: GetUserData; error: Error | null }
        console.log('Fetched user data:', data) // Debug log to check fetched user data
        if (error) throw error
        setUser(data.user)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user')
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // @ts-ignore
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  return { user, loading, error }
}
