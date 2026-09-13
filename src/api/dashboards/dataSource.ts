/**
 * Default dashboard data source singleton.
 * Can be swapped for HttpDashboardDataSource in production backend integration.
 */

import type { IDashboardDataSource } from '@/types/dashboards'
import { MockDashboardDataSource } from './mockDataSource'

export const defaultDashboardDataSource: IDashboardDataSource = new MockDashboardDataSource()
