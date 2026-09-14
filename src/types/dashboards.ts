/**
 * Domain read models, availability states, and data source interfaces for Dashboards.
 * Conforms to _bmad-output/specs/spec-dashboards/dashboard-api-contract.md.
 */

export type WidgetAvailabilityState = 'available' | 'unavailable'

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

export type PersonTier = 'self' | 'reporting' | 'pp' | 'colleague'

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
  tier: PersonTier
}

export interface DashboardHeaderMetadata {
  eyebrow: 'WORKSPACE / DASHBOARDS'
  accentColor: string // 'oklch(0.52 0.20 264)'
  provenanceTag: string // 'SCOPE RESOLVED LIVE PER REQUEST'
  lastResolvedAt: string // ISO 8601 UTC
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

export interface PeoplePartnerDashboardReadModel {
  header: DashboardHeaderMetadata
  evaluatedScope: {
    type: 'PEOPLE_PARTNER_ASSIGNMENT'
    viewerUserId: string
    targetCount: number
    evaluatedAt: string
    policyLabel: 'SCOPE: PEOPLE_PARTNER_ASSIGNMENT (DIRECT)'
  }
  headcount: AvailableWidgetState<{
    count: number
    wscope: 'SCOPE: PEOPLE_PARTNER_ASSIGNMENT'
  }>
  peopleTable: AvailableWidgetState<{
    rows: DashboardPersonRow[]
    totalCount: number
    wscope: 'SCOPE: PEOPLE_PARTNER_ASSIGNMENT'
  }>
  navigation: {
    allEmployeesUrl: string
    savedViewsUrl: string
    campaignsUrl: string
    departuresUrl: string
  }
  widgets: {
    incompleteProfiles:
      | AvailableWidgetState<{
          count: number
          wscope: 'SCOPE: PEOPLE_PARTNER_ASSIGNMENT'
        }>
      | UnavailableWidgetState
    riskCounts: UnavailableWidgetState
    assignedActionItems: UnavailableWidgetState
    cdsMilestones: UnavailableWidgetState
    campaignCompletion: UnavailableWidgetState
  }
}

export type DashboardPreset = 'unit-manager' | 'people-partner'

export interface IDashboardDataSource {
  getUnitManagerDashboard(): Promise<UnitManagerDashboardReadModel>
  getPeoplePartnerDashboard(): Promise<PeoplePartnerDashboardReadModel>
}
