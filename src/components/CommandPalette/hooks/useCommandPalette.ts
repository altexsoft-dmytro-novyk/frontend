import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUsersList } from '@/api/hooks/useUsers'
import { useCommandMenu } from '@/contexts/CommandMenuContext'
import type { UserListItem } from '@/types/domain'

const MAX_RESULTS = 8

export const useCommandPalette = () => {
  const { open, setOpen } = useCommandMenu()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const { data } = useUsersList({ pageSize: 200 })

  const people = useMemo(() => {
    const items = data?.items ?? []
    const q = query.trim().toLowerCase()
    const matches = q
      ? items.filter(u =>
          `${u.firstName} ${u.lastName} ${u.workEmail} ${u.position}`.toLowerCase().includes(q)
        )
      : items
    return matches.slice(0, MAX_RESULTS)
  }, [data, query])

  const go = (path: string) => {
    setOpen(false)
    setQuery('')
    navigate(path)
  }

  const openPerson = (person: UserListItem) => go(`/people/${person.id}`)

  return { open, setOpen, query, setQuery, people, go, openPerson }
}
