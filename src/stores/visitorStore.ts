import { createStore } from "solid-js/store";
import { createSignal } from "solid-js";
import { visitantesService } from "../lib/supabase/services";
import type { Visitante } from "../lib/supabase/client";

// ============================================================================
// VISITOR STORE HÍBRIDO - REFACTORIZADO
// ============================================================================
// Combina cache local reactivo con Supabase como fuente de verdad
// - Cache rápido para UI responsive
// - Sincronización automática con base de datos
// - Fallback inteligente para operaciones offline
// ============================================================================

interface VisitorStoreState {
  visitors: Visitante[];
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
  isOnline: boolean;
}

// Estado reactivo del store
const [state, setState] = createStore<VisitorStoreState>({
  visitors: [],
  loading: false,
  error: null,
  lastSync: null,
  isOnline: navigator.onLine
});

// Signals para operaciones específicas
const [syncing, setSyncing] = createSignal(false);
const [pendingOperations, setPendingOperations] = createSignal<any[]>([]);

// ============================================================================
// CONFIGURACIÓN DEL CACHE
// ============================================================================

const CACHE_KEY = 'ccb_visitors_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const SYNC_INTERVAL = 30 * 1000; // 30 segundos

// ============================================================================
// UTILIDADES DE CACHE LOCAL
// ============================================================================

const saveToLocalStorage = (visitors: Visitante[]) => {
  try {
    const cacheData = {
      visitors,
      timestamp: Date.now(),
      version: '2.0'
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('📦 Error guardando cache local:', error);
  }
};

const loadFromLocalStorage = (): Visitante[] => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return [];
    
    const cacheData = JSON.parse(cached);
    const isExpired = Date.now() - cacheData.timestamp > CACHE_TTL;
    
    if (isExpired) {
      localStorage.removeItem(CACHE_KEY);
      return [];
    }
    
    return cacheData.visitors || [];
  } catch (error) {
    console.warn('📦 Error cargando cache local:', error);
    return [];
  }
};

// ============================================================================
// FUNCIONES DE SINCRONIZACIÓN
// ============================================================================

const syncWithSupabase = async (force = false): Promise<boolean> => {
  if (syncing() && !force) return false;
  
  setSyncing(true);
  setState('loading', true);
  setState('error', null);
  
  try {
    console.log('🔄 Sincronizando visitantes con Supabase...');
    
    // Obtener datos frescos de Supabase
    const freshVisitors = await visitantesService.obtenerTodos();
    
    // Actualizar estado reactivo
    setState({
      visitors: freshVisitors,
      lastSync: new Date(),
      error: null
    });
    
    // Actualizar cache local
    saveToLocalStorage(freshVisitors);
    
    console.log(`✅ Sincronización completada: ${freshVisitors.length} visitantes`);
    return true;
    
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    setState('error', `Error de sincronización: ${error.message}`);
    
    // En caso de error, cargar desde cache local como fallback
    const cachedVisitors = loadFromLocalStorage();
    if (cachedVisitors.length > 0) {
      setState('visitors', cachedVisitors);
      console.log('📦 Cargados visitantes desde cache local');
    }
    
    return false;
  } finally {
    setState('loading', false);
    setSyncing(false);
  }
};

// ============================================================================
// STORE PRINCIPAL
// ============================================================================

export const visitorStore = {
  // Getters reactivos
  get visitors() { return state.visitors; },
  get loading() { return state.loading; },
  get error() { return state.error; },
  get lastSync() { return state.lastSync; },
  get isOnline() { return state.isOnline; },
  get syncing() { return syncing(); },
  
  // ========================================================================
  // INICIALIZACIÓN
  // ========================================================================
  
  async initialize() {
    console.log('🚀 Inicializando VisitorStore híbrido...');
    
    // 1. Cargar cache local inmediatamente para UI responsive
    const cachedVisitors = loadFromLocalStorage();
    if (cachedVisitors.length > 0) {
      setState('visitors', cachedVisitors);
      console.log(`📦 Cache local cargado: ${cachedVisitors.length} visitantes`);
    }
    
    // 2. Sincronizar con Supabase en background
    await syncWithSupabase();
    
    // 3. Configurar sincronización automática
    this.setupAutoSync();
    
    // 4. Detectar cambios de conectividad
    this.setupOnlineListener();
  },
  
  // ========================================================================
  // OPERACIONES CRUD HÍBRIDAS
  // ========================================================================
  
  async addVisitor(visitorData: Omit<Visitante, 'id' | 'created_at' | 'updated_at'>): Promise<Visitante | null> {
    setState('loading', true);
    setState('error', null);
    
    try {
      console.log('➕ Agregando nuevo visitante:', visitorData.email);
      
      // 1. Crear en Supabase (fuente de verdad)
      const newVisitor = await visitantesService.crear(visitorData);
      
      if (newVisitor) {
        // 2. Actualizar cache local reactivo
        setState('visitors', prev => [newVisitor, ...prev]);
        
        // 3. Persistir en localStorage
        saveToLocalStorage(state.visitors);
        
        console.log('✅ Visitante agregado exitosamente');
        return newVisitor;
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Error agregando visitante:', error);
      setState('error', `Error creando visitante: ${error.message}`);
      
      // TODO: Agregar a cola de operaciones pendientes para retry
      return null;
      
    } finally {
      setState('loading', false);
    }
  },
  
  async updateVisitor(id: string, updates: Partial<Visitante>): Promise<boolean> {
    setState('loading', true);
    setState('error', null);
    
    try {
      console.log('✏️ Actualizando visitante:', id);
      
      // 1. Actualizar en Supabase
      const updated = await visitantesService.actualizar(id, updates);
      
      if (updated) {
        // 2. Actualizar cache local
        setState('visitors', prev => 
          prev.map(v => v.id === id ? { ...v, ...updates } : v)
        );
        
        // 3. Persistir cambios
        saveToLocalStorage(state.visitors);
        
        console.log('✅ Visitante actualizado exitosamente');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Error actualizando visitante:', error);
      setState('error', `Error actualizando visitante: ${error.message}`);
      return false;
      
    } finally {
      setState('loading', false);
    }
  },
  
  async deleteVisitor(id: string): Promise<boolean> {
    setState('loading', true);
    setState('error', null);
    
    try {
      console.log('🗑️ Eliminando visitante:', id);
      
      // 1. Eliminar de Supabase
      const deleted = await visitantesService.eliminar(id);
      
      if (deleted) {
        // 2. Remover del cache local
        setState('visitors', prev => prev.filter(v => v.id !== id));
        
        // 3. Actualizar localStorage
        saveToLocalStorage(state.visitors);
        
        console.log('✅ Visitante eliminado exitosamente');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Error eliminando visitante:', error);
      setState('error', `Error eliminando visitante: ${error.message}`);
      return false;
      
    } finally {
      setState('loading', false);
    }
  },
  
  // ========================================================================
  // BÚSQUEDAS Y CONSULTAS
  // ========================================================================
  
  findVisitor(query: string): Visitante | undefined {
    const searchTerm = query.toLowerCase().trim();
    
    return state.visitors.find(visitor => 
      visitor.email?.toLowerCase() === searchTerm ||
      visitor.telefono === searchTerm ||
      visitor.telefono?.replace(/\D/g, '') === searchTerm.replace(/\D/g, '') ||
      visitor.codigo_unico?.toLowerCase() === searchTerm ||
      `${visitor.nombre} ${visitor.apellido}`.toLowerCase().includes(searchTerm)
    );
  },
  
  findVisitorsByEmail(email: string): Visitante[] {
    return state.visitors.filter(v => 
      v.email?.toLowerCase().includes(email.toLowerCase())
    );
  },
  
  getVisitorById(id: string): Visitante | undefined {
    return state.visitors.find(v => v.id === id);
  },
  
  // ========================================================================
  // GESTIÓN DE CONECTIVIDAD Y SINCRONIZACIÓN
  // ========================================================================
  
  setupAutoSync() {
    // Sincronización automática cada 30 segundos
    setInterval(async () => {
      if (state.isOnline && !syncing()) {
        await syncWithSupabase();
      }
    }, SYNC_INTERVAL);
  },
  
  setupOnlineListener() {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      setState('isOnline', isOnline);
      
      if (isOnline && !syncing()) {
        // Reconectado, sincronizar inmediatamente
        syncWithSupabase();
      }
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  },
  
  // ========================================================================
  // OPERACIONES MANUALES
  // ========================================================================
  
  async refresh() {
    return await syncWithSupabase(true);
  },
  
  clearCache() {
    localStorage.removeItem(CACHE_KEY);
    setState('visitors', []);
    setState('lastSync', null);
    console.log('🧹 Cache local limpiado');
  },
  
  // ========================================================================
  // ESTADÍSTICAS Y UTILIDADES
  // ========================================================================
  
  getStats() {
    const visitors = state.visitors;
    
    return {
      total: visitors.length,
      activos: visitors.filter(v => v.estado === 'activo').length,
      nuevosHoy: visitors.filter(v => {
        const today = new Date().toDateString();
        const visitorDate = new Date(v.created_at || v.fecha_registro || '').toDateString();
        return visitorDate === today;
      }).length,
      conTelefono: visitors.filter(v => v.telefono).length,
      porComunicacion: {
        email: visitors.filter(v => v.preferencia_comunicacion === 'email').length,
        sms: visitors.filter(v => v.preferencia_comunicacion === 'sms').length,
        ambos: visitors.filter(v => v.preferencia_comunicacion === 'ambos').length
      }
    };
  }
};

// ============================================================================
// INICIALIZACIÓN AUTOMÁTICA
// ============================================================================

// Inicializar automáticamente cuando se importa el store
visitorStore.initialize().catch(error => {
  console.error('❌ Error inicializando VisitorStore:', error);
});

export default visitorStore;