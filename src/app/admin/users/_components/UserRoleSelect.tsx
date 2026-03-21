'use client'

import { useTransition } from 'react'
import { changeUserRole } from '@/server/actions/userActions'

interface UserRoleSelectProps {
  userId: string
  currentRole: string
}

export function UserRoleSelect({ userId, currentRole }: UserRoleSelectProps) {
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const role = e.target.value as 'ADMIN' | 'MODERATOR' | 'MEMBER'
    startTransition(async () => {
      await changeUserRole(userId, role)
    })
  }

  return (
    <select
      defaultValue={currentRole}
      onChange={handleChange}
      disabled={isPending}
      className="rounded-md border bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
    >
      <option value="MEMBER">Üye</option>
      <option value="MODERATOR">Moderatör</option>
      <option value="ADMIN">Admin</option>
    </select>
  )
}
