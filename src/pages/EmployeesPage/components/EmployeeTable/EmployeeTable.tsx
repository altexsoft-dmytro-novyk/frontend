import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { EmployeeListItem } from '@/types/api'
import {
  DASH,
  formatBirthday,
  formatIsoDate,
  fullName,
  getInitials,
} from '@/lib/employeeFormatters'

interface EmployeeTableProps {
  rows: EmployeeListItem[]
  /** Dim the body while a filter/page change is loading (keepPreviousData). */
  isStale?: boolean
}

const NullableCell = ({ value }: { value: string | null }) =>
  value ? <span>{value}</span> : <span className="text-muted-foreground">{DASH}</span>

export const EmployeeTable = ({ rows, isStale = false }: EmployeeTableProps) => {
  const { t } = useTranslation()

  return (
    <div
      className={cn('overflow-x-auto transition-opacity', isStale && 'opacity-60')}
      aria-busy={isStale}
    >
      <Table>
        <TableCaption className="sr-only">{t('employees.tableCaption')}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>{t('employees.columns.employee')}</TableHead>
            <TableHead>{t('employees.columns.position')}</TableHead>
            <TableHead>{t('employees.columns.country')}</TableHead>
            <TableHead>{t('employees.columns.city')}</TableHead>
            <TableHead>{t('employees.columns.workEmail')}</TableHead>
            <TableHead>{t('employees.columns.workPhone')}</TableHead>
            <TableHead>{t('employees.columns.birthday')}</TableHead>
            <TableHead>{t('employees.columns.companyJoinDate')}</TableHead>
            <TableHead>{t('employees.columns.employmentStatus')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(employee => (
            <TableRow key={employee.id}>
              <TableCell>
                <Link
                  to={`/employees/${employee.id}`}
                  className="flex items-center gap-2.5 font-medium hover:underline"
                >
                  <Avatar size="sm">
                    {employee.photo ? <AvatarImage src={employee.photo} alt="" /> : null}
                    <AvatarFallback className="text-[0.7rem] font-semibold">
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  {fullName(employee)}
                </Link>
              </TableCell>
              <TableCell>{employee.position}</TableCell>
              <TableCell>{employee.country}</TableCell>
              <TableCell>
                <NullableCell value={employee.city} />
              </TableCell>
              <TableCell>{employee.workEmail}</TableCell>
              <TableCell>
                <NullableCell value={employee.workPhone} />
              </TableCell>
              <TableCell className="font-mono text-xs">
                {formatBirthday(employee.birthDay, employee.birthMonth)}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {formatIsoDate(employee.companyJoinDate)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={employee.employmentStatus === 'dismissed' ? 'destructive' : 'secondary'}
                >
                  {employee.employmentStatus === 'dismissed'
                    ? t('employees.statusDismissed')
                    : t('employees.statusActive')}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
