// Interfaces específicas para el sistema de check-in
import { Visitante, Evento } from '../../../lib/types';

export interface CheckInResult {
  success: boolean;
  visitante?: Visitante;
  evento?: Evento;
  codigo?: string;
  error?: string;
  timestamp?: string;
}

export interface CheckinStats {
  totalCheckIns: number;
  visitantesUnicos: number;
  eventosActivos: number;
  ultimoCheckIn: string | null;
}

export interface CheckinScannerProps {
  tipoCheckIn: 'codigo' | 'telefono';
  setTipoCheckIn: (tipo: 'codigo' | 'telefono') => void;
  codigoInput: string;
  setCodigoInput: (codigo: string) => void;
  telefonoInput: string;
  setTelefonoInput: (telefono: string) => void;
  procesando: boolean;
  onCheckIn: () => void;
}

export interface CheckinResultProps {
  resultado: CheckInResult | null;
}

export interface CheckinRecentListProps {
  checkInsRecientes: CheckInResult[];
  onRefresh?: () => void;
}

export interface CheckinStatsProps {
  estadisticas: CheckinStats;
}
