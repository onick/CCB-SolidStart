// =============================================================================
// TIPOS BASE DEL SISTEMA
// =============================================================================

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// TIPOS DE USUARIO Y AUTENTICACIÓN
// =============================================================================

export interface User extends BaseEntity {
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  VIEWER = 'viewer',
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

// =============================================================================
// TIPOS DE VISITANTES
// =============================================================================

export interface Visitor extends BaseEntity {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  idNumber: string;
  idType: IdentificationTypeType;
  checkInTime: Date;
  checkOutTime?: Date;
  purpose: VisitPurpose;
  notes?: string;
  photoUrl?: string;
  qrCode: string;
  status: VisitorStatus;
}

export enum IdentificationType {
  CEDULA = 'cedula',
  PASSPORT = 'passport',
  LICENSE = 'license',
  OTHER = 'other',
}

export type IdentificationTypeType = keyof typeof IdentificationType;

export enum VisitPurpose {
  EXHIBITION = 'exhibition',
  EVENT = 'event',
  MEETING = 'meeting',
  RESEARCH = 'research',
  EDUCATION = 'education',
  OTHER = 'other',
}

export enum VisitorStatus {
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  BANNED = 'banned',
}

// =============================================================================
// TIPOS DE EVENTOS
// =============================================================================

export interface Event extends BaseEntity {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  capacity: number;
  currentAttendees: number;
  category: EventCategory;
  status: EventStatus;
  imageUrl?: string;
  organizer: string;
  isPublic: boolean;
  requiresRegistration: boolean;
  attendees: EventAttendee[];
  tags: string[];
}

export enum EventCategory {
  EXHIBITION = 'exhibition',
  CONCERT = 'concert',
  WORKSHOP = 'workshop',
  CONFERENCE = 'conference',
  THEATER = 'theater',
  CULTURAL = 'cultural',
  EDUCATIONAL = 'educational',
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface EventAttendee extends BaseEntity {
  eventId: string;
  visitorId: string;
  registrationDate: Date;
  attendanceConfirmed: boolean;
  checkInTime?: Date;
  specialRequirements?: string;
}

// =============================================================================
// TIPOS DE ANALÍTICAS Y REPORTES
// =============================================================================

export interface AnalyticsData {
  totalVisitors: number;
  dailyVisitors: DailyVisitorData[];
  topEvents: EventPopularityData[];
  visitorDemographics: VisitorDemographics;
  averageVisitDuration: number;
  peakHours: HourlyData[];
}

export interface DailyVisitorData {
  date: string;
  count: number;
  checkIns: number;
  checkOuts: number;
}

export interface EventPopularityData {
  eventId: string;
  eventTitle: string;
  attendeeCount: number;
  category: EventCategory;
}

export interface VisitorDemographics {
  ageGroups: AgeGroupData[];
  purposes: PurposeData[];
  timeOfDay: TimeOfDayData[];
}

export interface AgeGroupData {
  range: string;
  count: number;
  percentage: number;
}

export interface PurposeData {
  purpose: VisitPurpose;
  count: number;
  percentage: number;
}

export interface TimeOfDayData {
  hour: number;
  count: number;
  label: string;
}

export interface HourlyData {
  hour: number;
  count: number;
  day: string;
}

// =============================================================================
// TIPOS DE FORMULARIOS
// =============================================================================

export interface VisitorFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  idNumber: string;
  idType: IdentificationTypeType;
  purpose: VisitPurpose;
  notes?: string;
}

export interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  category: EventCategory;
  organizer: string;
  isPublic: boolean;
  requiresRegistration: boolean;
  tags: string[];
  imageUrl?: string;
}

// =============================================================================
// TIPOS DE API Y ESTADOS
// =============================================================================

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface FilterOptions {
  dateFrom?: Date;
  dateTo?: Date;
  category?: EventCategory;
  status?: EventStatus | VisitorStatus;
  search?: string;
}

// =============================================================================
// TIPOS DE CONFIGURACIÓN
// =============================================================================

export interface AppConfig {
  siteName: string;
  version: string;
  apiUrl: string;
  features: {
    enableQRScanning: boolean;
    enableNotifications: boolean;
    enableAnalytics: boolean;
    enableExports: boolean;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    darkMode: boolean;
  };
}

// =============================================================================
// TIPOS DE NOTIFICACIONES
// =============================================================================

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

// =============================================================================
// TIPOS UTILITARIOS
// =============================================================================

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
}; 