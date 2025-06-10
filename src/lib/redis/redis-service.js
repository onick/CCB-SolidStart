// redis-service.js - Servicio Redis para CCB
import Redis from 'redis';
import { supabase } from '../supabase/client';

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Configuración Redis (ajustar según tu setup)
      this.client = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      await this.client.connect();
      this.isConnected = true;
      console.log('✅ Redis conectado');
    } catch (error) {
      console.error('❌ Error conectando Redis:', error);
      this.isConnected = false;
    }
  }

  // =============================================
  // EVENTOS - GESTIÓN DE CACHE
  // =============================================

  async getEventos(tipo = 'all') {
    const cacheKey = `eventos:${tipo}`;
    
    try {
      // 1. Buscar en cache
      if (this.isConnected) {
        const cached = await this.client.get(cacheKey);
        if (cached) {
          console.log(`🚀 Cache HIT: ${cacheKey}`);
          return JSON.parse(cached);
        }
      }

      // 2. Cache MISS - Buscar en Supabase
      console.log(`💾 Cache MISS: ${cacheKey} - Fetching from Supabase`);
      let query = supabase.from('eventos').select('*');
      
      // Aplicar filtros según tipo
      if (tipo === 'publicos') {
        query = query.in('estado', ['activo', 'proximo']);
      }
      
      const { data: eventos, error } = await query.order('fecha', { ascending: true });
      
      if (error) throw error;

      // 3. Guardar en cache (TTL: 5 minutos)
      if (this.isConnected) {
        await this.client.setEx(cacheKey, 300, JSON.stringify(eventos));
        console.log(`💾 Cached: ${cacheKey}`);
      }

      return eventos;
    } catch (error) {
      console.error('❌ Error en getEventos:', error);
      // Fallback a Supabase directo si Redis falla
      const { data } = await supabase.from('eventos').select('*');
      return data || [];
    }
  }

  async createEvento(eventoData) {
    try {
      // 1. Crear en Supabase (fuente de verdad)
      const { data: evento, error } = await supabase
        .from('eventos')
        .insert([eventoData])
        .select()
        .single();

      if (error) throw error;

      // 2. Invalidar caches relacionados
      await this.invalidateEventosCache();
      
      console.log('✅ Evento creado y cache invalidado');
      return evento;
    } catch (error) {
      console.error('❌ Error creando evento:', error);
      throw error;
    }
  }

  async invalidateEventosCache() {
    if (!this.isConnected) return;
    
    try {
      const keys = ['eventos:all', 'eventos:publicos', 'eventos:admin'];
      await Promise.all(keys.map(key => this.client.del(key)));
      console.log('🗑️ Cache de eventos invalidado');
    } catch (error) {
      console.error('❌ Error invalidando cache:', error);
    }
  }
}

// Singleton instance
export const redisService = new RedisService();
