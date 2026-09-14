export interface BusinessAuthUser {
  businessId: string;
  email: string;
  name: string;
  status: string;
}

export interface DashboardStats {
  todayAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  todayRevenueTrend: number;
  weekRevenueTrend: number;
  monthRevenueTrend: number;
}

export interface UpcomingAppointment {
  id: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerMobile: string;
  serviceName: string;
  staffName: string;
  status: string;
  source: string;
}

export interface RevenueChartPoint {
  date: string;
  jalaliDate: string;
  revenue: number;
}

export interface AppointmentsChartPoint {
  date: string;
  jalaliDate: string;
  confirmed: number;
  pending: number;
  completed: number;
  cancelled: number;
}

export interface BusinessService {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface BusinessStaff {
  id: string;
  name: string;
  photo: string | null;
  specialty: string | null;
  bio: string | null;
  isActive: boolean;
  todayAppointmentCount: number;
  services: { id: string; name: string }[];
  workingHours: {
    dayOfWeek: number;
    isClosed: boolean;
    startTime: string | null;
    endTime: string | null;
    useBusinessDefault: boolean;
  }[];
}

export interface BusinessWorkingHours {
  id: string;
  dayOfWeek: number;
  isClosed: boolean;
  startTime: string | null;
  endTime: string | null;
}

export interface BusinessHoliday {
  id: string;
  date: string;
  reason: string | null;
}

export interface BusinessAppointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  source: string;
  internalNote: string | null;
  cancelReason: string | null;
  customer: { id: string; name: string; mobile: string; isBlocked: boolean };
  service: { id: string; name: string; durationMinutes: number; price: number };
  staff: { id: string; name: string };
}

export interface BusinessCustomer {
  id: string;
  name: string;
  mobile: string;
  isBlocked: boolean;
  totalAppointments: number;
  lastVisitDate: string | null;
  createdAt: string;
  notes: { id: string; content: string; createdAt: string }[];
}

export interface ReportData {
  totalRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  cancellationRate: number;
  avgRevenuePerAppointment: number;
  revenueByService: { name: string; revenue: number; count: number }[];
  revenueByStaff: { name: string; revenue: number; count: number }[];
  dailyRevenue: { date: string; jalaliDate: string; revenue: number }[];
  dailyAppointments: { date: string; jalaliDate: string; confirmed: number; pending: number; completed: number; cancelled: number }[];
  statusBreakdown: { name: string; value: number; color: string }[];
}

export interface PlanInfo {
  id: string;
  name: string;
  price: number;
  maxStaff: number;
  maxServices: number;
  hasSms: boolean;
  hasReports: boolean;
  hasCustomSms: boolean;
  hasApi: boolean;
  hasPriority: boolean;
}

export interface SubscriptionInfo {
  id: string;
  plan: PlanInfo;
  startDate: string;
  endDate: string;
  isActive: boolean;
  daysRemaining: number;
}

export interface PaymentRecord {
  id: string;
  planName: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface SmartSlot {
  startTime: string;
  endTime: string;
  staffId: string;
  staffName: string;
  availableServices: string[];
}
