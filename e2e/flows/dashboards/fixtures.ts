/**
 * Test fixtures for People Management Dashboards (Unit Manager preset)
 * Conforms to UnitManagerDashboardReadModel in _bmad-output/specs/spec-dashboards/dashboard-api-contract.md
 */

export const SESSION_STORAGE_KEY = 'pp.session'

export const SEEDED_SESSION_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMjIyMjIyMi0yMjIyLTQyMjItODIyMi0yMjIyMjIyMjIyMjIiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6NDEwMjQ0NDgwMH0.test-signature-not-verified-client-side'

export interface UnavailableColumnState {
  status: 'unavailable'
  sourceFr: string
  label: string
}

export interface AvailableWidgetState<TData> {
  status: 'available'
  data: TData
  sourceFr?: string
}

export interface UnavailableWidgetState {
  status: 'unavailable'
  missingCapability: string
  sourceFr: string
  unavailableReason: string
}

export interface DashboardPersonRow {
  id: string
  firstName: string
  lastName: string
  workEmail: string
  avatarUrl: string | null
  position: string | null
  grade: string | null
  employmentType: string | null
  project?: UnavailableColumnState
  leaveStatus?: UnavailableColumnState
  riskLevel?: UnavailableColumnState
  tier: 'self' | 'reporting' | 'pp' | 'colleague'
}

export interface DashboardHeaderMetadata {
  eyebrow: 'WORKSPACE / DASHBOARDS'
  accentColor: string
  provenanceTag: string
  lastResolvedAt: string
}

export interface UnitManagerDashboardReadModel {
  header: DashboardHeaderMetadata
  evaluatedScope: {
    type: 'REPORTING_LINE'
    viewerUserId: string
    targetCount: number
    evaluatedAt: string
    policyLabel: 'SCOPE: REPORTING_LINE (TRANSITIVE)'
  }
  headcount: AvailableWidgetState<{
    count: number
    wscope: 'SCOPE: REPORTING_LINE'
  }>
  peopleTable: AvailableWidgetState<{
    rows: DashboardPersonRow[]
    totalCount: number
    wscope: 'SCOPE: REPORTING_LINE'
  }>
  navigation: {
    allEmployeesUrl: string
    savedViewsUrl: string
    resourcingUrl: string
    riskDashboardUrl: string
    mentorshipHubUrl: string
    campaignsUrl: string
  }
  widgets: {
    riskCounts: UnavailableWidgetState
    unitActionItems: UnavailableWidgetState
    myActionItems: UnavailableWidgetState
    resourcingRequests: UnavailableWidgetState
    openCampaigns: UnavailableWidgetState
  }
}

export const mockPopulatedUnitManagerDashboard: UnitManagerDashboardReadModel = {
  header: {
    eyebrow: 'WORKSPACE / DASHBOARDS',
    accentColor: 'oklch(0.52 0.20 264)',
    provenanceTag: 'SCOPE RESOLVED LIVE PER REQUEST',
    lastResolvedAt: '2026-09-13T10:00:00Z',
  },
  evaluatedScope: {
    type: 'REPORTING_LINE',
    viewerUserId: 'um-user-001',
    targetCount: 3,
    evaluatedAt: '2026-09-13T10:00:00Z',
    policyLabel: 'SCOPE: REPORTING_LINE (TRANSITIVE)',
  },
  headcount: {
    status: 'available',
    data: {
      count: 3,
      wscope: 'SCOPE: REPORTING_LINE',
    },
  },
  peopleTable: {
    status: 'available',
    data: {
      totalCount: 3,
      wscope: 'SCOPE: REPORTING_LINE',
      rows: [
        {
          id: 'emp-001',
          firstName: 'Alice',
          lastName: 'Smith',
          workEmail: 'alice.smith@example.com',
          avatarUrl: null,
          position: 'Senior Engineer',
          grade: 'L4',
          employmentType: 'Full-time',
          project: {
            status: 'unavailable',
            sourceFr: 'PM-FR-37',
            label: 'Project',
          },
          leaveStatus: {
            status: 'unavailable',
            sourceFr: 'PM-FR-36',
            label: 'Leave',
          },
          riskLevel: {
            status: 'unavailable',
            sourceFr: 'PM-FR-21',
            label: 'Risk',
          },
          tier: 'reporting',
        },
        {
          id: 'emp-002',
          firstName: 'Bob',
          lastName: 'Jones',
          workEmail: 'bob.jones@example.com',
          avatarUrl: null,
          position: 'Staff Engineer',
          grade: 'L5',
          employmentType: 'Full-time',
          project: {
            status: 'unavailable',
            sourceFr: 'PM-FR-37',
            label: 'Project',
          },
          leaveStatus: {
            status: 'unavailable',
            sourceFr: 'PM-FR-36',
            label: 'Leave',
          },
          riskLevel: {
            status: 'unavailable',
            sourceFr: 'PM-FR-21',
            label: 'Risk',
          },
          tier: 'reporting',
        },
        {
          id: 'emp-003',
          firstName: 'Charlie',
          lastName: 'Brown',
          workEmail: 'charlie.brown@example.com',
          avatarUrl: null,
          position: 'QA Engineer',
          grade: 'L3',
          employmentType: 'Contract',
          project: {
            status: 'unavailable',
            sourceFr: 'PM-FR-37',
            label: 'Project',
          },
          leaveStatus: {
            status: 'unavailable',
            sourceFr: 'PM-FR-36',
            label: 'Leave',
          },
          riskLevel: {
            status: 'unavailable',
            sourceFr: 'PM-FR-21',
            label: 'Risk',
          },
          tier: 'reporting',
        },
      ],
    },
  },
  navigation: {
    allEmployeesUrl: '/employees',
    savedViewsUrl: '/employees/views',
    resourcingUrl: '/resourcing',
    riskDashboardUrl: '/risks',
    mentorshipHubUrl: '/mentorship',
    campaignsUrl: '/campaigns',
  },
  widgets: {
    riskCounts: {
      status: 'unavailable',
      missingCapability: 'Risk Tracking',
      sourceFr: 'PM-FR-21',
      unavailableReason: 'PM-FR-21 risk engine is uncovered',
    },
    unitActionItems: {
      status: 'unavailable',
      missingCapability: 'Action Items',
      sourceFr: 'PM-FR-19',
      unavailableReason: 'PM-FR-19 action item lifecycle is uncovered',
    },
    myActionItems: {
      status: 'unavailable',
      missingCapability: 'Action Items',
      sourceFr: 'PM-FR-19',
      unavailableReason: 'PM-FR-19 action item lifecycle is uncovered',
    },
    resourcingRequests: {
      status: 'unavailable',
      missingCapability: 'Resourcing',
      sourceFr: 'PM-FR-23',
      unavailableReason: 'PM-FR-23 resourcing workflow is uncovered',
    },
    openCampaigns: {
      status: 'unavailable',
      missingCapability: 'Campaigns',
      sourceFr: 'PM-FR-20',
      unavailableReason: 'PM-FR-20 campaigns lifecycle is uncovered',
    },
  },
}

export const mockZeroHeadcountUnitManagerDashboard: UnitManagerDashboardReadModel = {
  ...mockPopulatedUnitManagerDashboard,
  evaluatedScope: {
    ...mockPopulatedUnitManagerDashboard.evaluatedScope,
    targetCount: 0,
  },
  headcount: {
    status: 'available',
    data: {
      count: 0,
      wscope: 'SCOPE: REPORTING_LINE',
    },
  },
  peopleTable: {
    status: 'available',
    data: {
      totalCount: 0,
      wscope: 'SCOPE: REPORTING_LINE',
      rows: [],
    },
  },
}

export const mockOmittedColumnsUnitManagerDashboard: UnitManagerDashboardReadModel = {
  ...mockPopulatedUnitManagerDashboard,
  peopleTable: {
    status: 'available',
    data: {
      totalCount: 1,
      wscope: 'SCOPE: REPORTING_LINE',
      rows: [
        {
          id: 'emp-004',
          firstName: 'Diana',
          lastName: 'Prince',
          workEmail: 'diana.prince@example.com',
          avatarUrl: null,
          position: 'Director of Engineering',
          grade: 'L6',
          employmentType: 'Full-time',
          tier: 'reporting',
          // project, leaveStatus, riskLevel are completely omitted
        },
      ],
    },
  },
}
