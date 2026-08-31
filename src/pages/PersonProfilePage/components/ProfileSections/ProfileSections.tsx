import { IdentityPanel } from '@/pages/PersonProfilePage/components/panels/IdentityPanel'
import { EmploymentPanel } from '@/pages/PersonProfilePage/components/panels/EmploymentPanel'
import {
  EmergencyContactsPanel,
  PersonalContactsPanel,
} from '@/pages/PersonProfilePage/components/panels/ContactsPanels'
import { DocumentsPanel } from '@/pages/PersonProfilePage/components/panels/DocumentsPanel'
import { RisksPanel } from '@/pages/PersonProfilePage/components/panels/RisksPanel'
import {
  FeedbacksPanel,
  NotesPanel,
} from '@/pages/PersonProfilePage/components/panels/NotesFeedbackPanels'
import { CareerTimelinePanel } from '@/pages/PersonProfilePage/components/panels/CareerTimelinePanel'
import { CdsPanel } from '@/pages/PersonProfilePage/components/panels/CdsPanel'
import { MentorshipPanel } from '@/pages/PersonProfilePage/components/panels/MentorshipPanel'
import { ActionItemsPanel } from '@/pages/PersonProfilePage/components/panels/ActionItemsPanel'
import {
  CustomFieldsPanel,
  LeavesPanel,
  ProjectsPanel,
  RequestHistoryPanel,
} from '@/pages/PersonProfilePage/components/panels/SimplePanels'
import { sectionGate } from '@/pages/PersonProfilePage/helpers/sectionGate'
import type { SectionKey, UserProfile } from '@/types/domain'

interface ProfileSectionsProps {
  id: string
  profile: UserProfile
  isSelf: boolean
}

export const ProfileSections = ({ id, profile, isSelf }: ProfileSectionsProps) => {
  const gate = (key: SectionKey) => sectionGate(profile.access, key)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        {gate('s1').visible && (
          <IdentityPanel id={id} profile={profile} canWrite={gate('s1').canWrite} />
        )}
        {gate('s4').visible && <EmploymentPanel id={id} canWrite={gate('s4').canWrite} />}
        {gate('s2').visible && <PersonalContactsPanel id={id} canWrite={gate('s2').canWrite} />}
        {gate('s3').visible && <EmergencyContactsPanel id={id} canWrite={gate('s3').canWrite} />}
        {gate('s11').visible && <ProjectsPanel profile={profile} />}
        {gate('s10').visible && <LeavesPanel id={id} />}
        {gate('s16').visible && <CustomFieldsPanel id={id} />}
        {gate('s15').visible && <RequestHistoryPanel id={id} />}
      </div>
      <div className="space-y-4">
        {gate('s9').visible && <CareerTimelinePanel id={id} canWrite={gate('s9').canWrite} />}
        {gate('s6').visible && <RisksPanel id={id} canWrite={gate('s6').canWrite} />}
        {gate('s7').visible && <NotesPanel id={id} canWrite={gate('s7').canWrite} />}
        {gate('s8').visible && <FeedbacksPanel id={id} canWrite={gate('s8').canWrite} />}
        {gate('s12').visible && <CdsPanel id={id} isSelf={isSelf} />}
        {gate('s13').visible && (
          <MentorshipPanel
            id={id}
            profile={profile}
            isSelf={isSelf}
            canWrite={gate('s13').canWrite}
          />
        )}
        {gate('s5').visible && (
          <DocumentsPanel id={id} isSelf={isSelf} canWrite={gate('s5').canWrite} />
        )}
        {gate('s14').visible && <ActionItemsPanel id={id} canWrite={gate('s14').canWrite} />}
      </div>
    </div>
  )
}
