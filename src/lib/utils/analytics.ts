// Tipos para análisis
export interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  visitors: number;
  events: number;
  registrations: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface VisitorStats {
  total: number;
  byDay: Record<string, number>;
  byEvent: Record<string, number>;
  byMonth: Record<string, number>;
  growth: number;
}

export interface EventStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  averageAttendance: number;
  topEvents: Array<{ name: string; attendance: number }>;
}

/**
 * Calcula estadísticas básicas de visitantes
 */
export const calculateVisitorStats = (visitors: any[]): VisitorStats => {
  if (!visitors || visitors.length === 0) {
    return {
      total: 0,
      byDay: {},
      byEvent: {},
      byMonth: {},
      growth: 0,
    };
  }

  const total = visitors.length;
  const byDay: Record<string, number> = {};
  const byEvent: Record<string, number> = {};
  const byMonth: Record<string, number> = {};

  visitors.forEach(visitor => {
    // Por día
    const date = new Date(visitor.registrationDate).toDateString();
    byDay[date] = (byDay[date] || 0) + 1;

    // Por evento
    if (visitor.event) {
      byEvent[visitor.event] = (byEvent[visitor.event] || 0) + 1;
    }

    // Por mes
    const month = new Date(visitor.registrationDate).toISOString().slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + 1;
  });

  // Calcular crecimiento (comparando el último mes con el anterior)
  const months = Object.keys(byMonth).sort();
  const growth = months.length >= 2 
    ? ((byMonth[months[months.length - 1]] - byMonth[months[months.length - 2]]) / byMonth[months[months.length - 2]]) * 100
    : 0;

  return {
    total,
    byDay,
    byEvent,
    byMonth,
    growth,
  };
};

/**
 * Calcula estadísticas básicas de eventos
 */
export const calculateEventStats = (events: any[]): EventStats => {
  if (!events || events.length === 0) {
    return {
      total: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      averageAttendance: 0,
      topEvents: [],
    };
  }

  const total = events.length;
  let active = 0;
  let completed = 0;
  let cancelled = 0;
  let totalAttendance = 0;

  const eventAttendance = events.map(event => ({
    name: event.name,
    attendance: event.registeredCount || 0,
  }));

  events.forEach(event => {
    switch (event.status) {
      case 'active':
        active++;
        break;
      case 'completed':
        completed++;
        break;
      case 'cancelled':
        cancelled++;
        break;
    }
    totalAttendance += event.registeredCount || 0;
  });

  const averageAttendance = total > 0 ? totalAttendance / total : 0;
  const topEvents = eventAttendance
    .sort((a, b) => b.attendance - a.attendance)
    .slice(0, 5);

  return {
    total,
    active,
    completed,
    cancelled,
    averageAttendance,
    topEvents,
  };
};

/**
 * Genera datos para gráfico de líneas (visitantes por día)
 */
export const generateVisitorsLineChart = (visitors: any[]): ChartData => {
  const visitorStats = calculateVisitorStats(visitors);
  const sortedDays = Object.keys(visitorStats.byDay).sort();
  
  return {
    labels: sortedDays.map(day => new Date(day).toLocaleDateString('es-DO')),
    datasets: [
      {
        label: 'Visitantes',
        data: sortedDays.map(day => visitorStats.byDay[day]),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
      },
    ],
  };
};

/**
 * Genera datos para gráfico de barras (eventos por mes)
 */
export const generateEventsBarChart = (events: any[]): ChartData => {
  const byMonth: Record<string, number> = {};
  
  events.forEach(event => {
    const month = new Date(event.date).toISOString().slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + 1;
  });
  
  const sortedMonths = Object.keys(byMonth).sort();
  
  return {
    labels: sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('es-DO', { month: 'long', year: 'numeric' });
      return monthName;
    }),
    datasets: [
      {
        label: 'Eventos',
        data: sortedMonths.map(month => byMonth[month]),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1,
      },
    ],
  };
};

/**
 * Genera datos para gráfico de dona (estado de eventos)
 */
export const generateEventStatusPieChart = (events: any[]): ChartData => {
  const eventStats = calculateEventStats(events);
  
  return {
    labels: ['Activos', 'Completados', 'Cancelados'],
    datasets: [
      {
        label: 'Estados de Eventos',
        data: [eventStats.active, eventStats.completed, eventStats.cancelled],
        backgroundColor: ['#3B82F6', '#10B981', '#EF4444'],
        borderColor: ['#2563EB', '#059669', '#DC2626'],
        borderWidth: 1,
      },
    ],
  };
};

/**
 * Calcula métricas de rendimiento
 */
export const calculatePerformanceMetrics = (
  visitors: any[],
  events: any[]
): Record<string, number> => {
  const visitorStats = calculateVisitorStats(visitors);
  const eventStats = calculateEventStats(events);
  
  const totalRegistrations = visitors.length;
  const totalEvents = events.length;
  const averageVisitorsPerEvent = totalEvents > 0 ? totalRegistrations / totalEvents : 0;
  const conversionRate = totalEvents > 0 ? (eventStats.completed / totalEvents) * 100 : 0;
  
  return {
    totalVisitors: visitorStats.total,
    totalEvents: eventStats.total,
    averageVisitorsPerEvent,
    conversionRate,
    growthRate: visitorStats.growth,
    averageAttendance: eventStats.averageAttendance,
  };
};

/**
 * Genera reporte de tendencias
 */
export const generateTrendsReport = (
  visitors: any[],
  events: any[],
  period: 'week' | 'month' | 'quarter' = 'month'
): any => {
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'quarter':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  const filteredVisitors = visitors.filter(visitor => 
    new Date(visitor.registrationDate) >= startDate
  );
  
  const filteredEvents = events.filter(event => 
    new Date(event.date) >= startDate
  );
  
  return {
    period,
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    visitors: calculateVisitorStats(filteredVisitors),
    events: calculateEventStats(filteredEvents),
    metrics: calculatePerformanceMetrics(filteredVisitors, filteredEvents),
    charts: {
      visitorsLine: generateVisitorsLineChart(filteredVisitors),
      eventsBar: generateEventsBarChart(filteredEvents),
      eventStatusPie: generateEventStatusPieChart(filteredEvents),
    },
  };
};

/**
 * Identifica patrones en los datos
 */
export const identifyPatterns = (visitors: any[]): any => {
  const patterns = {
    peakDays: [] as string[],
    peakHours: [] as number[],
    popularEvents: [] as string[],
    seasonalTrends: {} as Record<string, number>,
  };
  
  if (!visitors || visitors.length === 0) {
    return patterns;
  }
  
  // Análisis por día de la semana
  const dayCount: Record<string, number> = {};
  const hourCount: Record<number, number> = {};
  const eventCount: Record<string, number> = {};
  const monthCount: Record<string, number> = {};
  
  visitors.forEach(visitor => {
    const date = new Date(visitor.registrationDate);
    
    // Día de la semana
    const dayName = date.toLocaleDateString('es-DO', { weekday: 'long' });
    dayCount[dayName] = (dayCount[dayName] || 0) + 1;
    
    // Hora del día
    const hour = date.getHours();
    hourCount[hour] = (hourCount[hour] || 0) + 1;
    
    // Evento
    if (visitor.event) {
      eventCount[visitor.event] = (eventCount[visitor.event] || 0) + 1;
    }
    
    // Mes para tendencias estacionales
    const month = date.toLocaleDateString('es-DO', { month: 'long' });
    monthCount[month] = (monthCount[month] || 0) + 1;
  });
  
  // Identificar patrones
  patterns.peakDays = Object.entries(dayCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([day]) => day);
  
  patterns.peakHours = Object.entries(hourCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));
  
  patterns.popularEvents = Object.entries(eventCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([event]) => event);
  
  patterns.seasonalTrends = monthCount;
  
  return patterns;
};

/**
 * Calcula score de engagement
 */
export const calculateEngagementScore = (
  visitors: any[],
  events: any[]
): number => {
  if (!visitors.length || !events.length) return 0;
  
  const totalRegistrations = visitors.length;
  const totalEvents = events.length;
  const completedEvents = events.filter(e => e.status === 'completed').length;
  const averageAttendance = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0) / totalEvents;
  
  // Fórmula simple de engagement (0-100)
  const registrationRate = Math.min((totalRegistrations / (totalEvents * 50)) * 100, 100); // Asumiendo capacidad promedio de 50
  const completionRate = (completedEvents / totalEvents) * 100;
  const attendanceRate = Math.min((averageAttendance / 50) * 100, 100);
  
  return Math.round((registrationRate + completionRate + attendanceRate) / 3);
}; 