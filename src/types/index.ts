// 기본 타입 정의
export interface Participant {
  id: string;
  name: string;
  email: string;
  color: string;
  events: Event[];
  mandatory?: boolean;
}

export interface Event {
  id: string;
  participant: string;
  day: number; // 0-4 (월-금)
  start: number; // 9.0-18.0 (시간)
  end: number; // 9.0-18.0 (시간)
  title: string;
  color: string;
  mandatory: boolean;
}

export interface Message {
  id: string;
  role: 'agent' | 'user';
  text: string;
  timestamp?: Date;
}

export type Step = 'idle' | 'askInvite' | 'askParticipants' | 'askTitle' | 'readyToSend';

export interface AgentData {
  title: string;
  participants: string[];
  transcript: Message[];
}

// 컴포넌트 Props 타입
export interface AppState {
  activeTab: 'agent' | 'calendar';
  agentData: AgentData | null;
  showTutorial: boolean;
  showOrganizerTutorial: boolean;
}

export interface AgentSchedulerProps {
  onComposeSchedule?: (payload: AgentData) => void;
}

export interface MeetingSchedulerProps {
  agentData?: AgentData | null;
  showOrganizerTutorialOnCalendar?: boolean;
  onCloseOrganizerTutorial?: () => void;
}

// 팀 및 조직 타입
export interface Team {
  id: string;
  name: string;
  members: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  department?: string;
  role?: string;
  timezone?: string;
}

// Microsoft Graph API 타입
export interface MicrosoftGraphUser {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
}

export interface MicrosoftGraphEvent {
  id: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: Array<{
    emailAddress: {
      address: string;
      name: string;
    };
    type: 'required' | 'optional';
  }>;
}

// 성능 모니터링 타입
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: {
    used: number;
    total: number;
  };
  componentName: string;
  timestamp: Date;
}

// 에러 처리 타입
export interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  timestamp: Date;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

// 접근성 타입
export interface AccessibilityOptions {
  announceChanges?: boolean;
  focusManagement?: boolean;
  keyboardNavigation?: boolean;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 설정 타입
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'ko' | 'en';
  notifications: boolean;
  autoSave: boolean;
  defaultMeetingDuration: number; // 분
}

// 유틸리티 타입
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 이벤트 타입
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  participants: string[];
  location?: string;
  description?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

// 필터 타입
export interface CalendarFilter {
  participants: string[];
  timeRange: {
    start: Date;
    end: Date;
  };
  showWeekends: boolean;
  showOnlyAvailable: boolean;
}

// 통계 타입
export interface MeetingStatistics {
  totalMeetings: number;
  averageDuration: number;
  mostActiveDay: string;
  mostActiveTime: string;
  participantCount: number;
  efficiencyScore: number;
}
