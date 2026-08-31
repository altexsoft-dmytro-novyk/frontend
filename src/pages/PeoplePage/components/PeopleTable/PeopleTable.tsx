import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UserAvatar } from '@/components/UserAvatar/UserAvatar'
import { EmploymentStatusBadge } from '@/components/EmploymentStatusBadge/EmploymentStatusBadge'
import { formatBirthday, formatDate, yearsSince } from '@/helpers/format'
import type { UserListItem } from '@/types/domain'

interface PeopleTableProps {
  rows: UserListItem[]
}

export const PeopleTable = ({ rows }: PeopleTableProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('directory.columns.name')}</TableHead>
            <TableHead>{t('directory.columns.position')}</TableHead>
            <TableHead>{t('directory.columns.location')}</TableHead>
            <TableHead className="hidden xl:table-cell">
              {t('directory.columns.workEmail')}
            </TableHead>
            <TableHead className="hidden 2xl:table-cell">
              {t('directory.columns.birthday')}
            </TableHead>
            <TableHead>{t('directory.columns.joined')}</TableHead>
            <TableHead>{t('directory.columns.status')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(person => (
            <TableRow
              key={person.id}
              className="cursor-pointer"
              onClick={() => navigate(`/people/${person.id}`)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <UserAvatar firstName={person.firstName} lastName={person.lastName} />
                  <span className="font-medium text-foreground">
                    {person.firstName} {person.lastName}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{person.position}</TableCell>
              <TableCell className="text-muted-foreground">
                {[person.city, person.country].filter(Boolean).join(', ')}
              </TableCell>
              <TableCell className="hidden text-muted-foreground xl:table-cell">
                {person.workEmail}
              </TableCell>
              <TableCell className="hidden text-muted-foreground 2xl:table-cell">
                {formatBirthday(person.birthDay, person.birthMonth) ?? '—'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(person.companyJoinDate)}
                <span className="ml-1 text-xs">
                  ({t('directory.tenure', { years: yearsSince(person.companyJoinDate) })})
                </span>
              </TableCell>
              <TableCell>
                <EmploymentStatusBadge status={person.employmentStatus} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
