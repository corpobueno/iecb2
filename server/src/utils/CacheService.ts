// src/utils/CacheService.ts
import NodeCache from 'node-cache';

/**
 * Serviço de cache centralizado usando node-cache
 *
 * Configuração:
 * - stdTTL: 300 segundos (5 minutos) - tempo padrão de vida do cache
 * - checkperiod: 60 segundos - verifica items expirados a cada 60 segundos
 * - useClones: false - retorna referência direta (mais rápido, menos memória)
 */
class CacheService {
    private cache: NodeCache;

    constructor() {
        this.cache = new NodeCache({
            stdTTL: 300, // 5 minutos padrão
            checkperiod: 60, // Verifica expiração a cada 60 segundos
            useClones: false // Não clonar objetos (performance)
        });

        // Log de estatísticas do cache
        this.cache.on('expired', (key, value) => {
            console.log(`Cache expirado: ${key}`);
        });
    }

    /**
     * Obtém um valor do cache
     */
    get<T>(key: string): T | undefined {
        return this.cache.get<T>(key);
    }

    /**
     * Define um valor no cache
     */
    set<T>(key: string, value: T, ttl?: number): boolean {
        return this.cache.set(key, value, ttl || 0);
    }

    /**
     * Remove um valor do cache
     */
    del(key: string | string[]): number {
        return this.cache.del(key);
    }

    /**
     * Limpa todo o cache
     */
    flush(): void {
        this.cache.flushAll();
    }

    /**
     * Verifica se uma chave existe no cache
     */
    has(key: string): boolean {
        return this.cache.has(key);
    }

    /**
     * Obtém estatísticas do cache
     */
    getStats() {
        return this.cache.getStats();
    }

    /**
     * Obtém todas as chaves do cache
     */
    keys(): string[] {
        return this.cache.keys();
    }

    /**
     * Invalida cache por padrão (regex)
     */
    invalidatePattern(pattern: string): number {
        const keys = this.cache.keys();
        const regex = new RegExp(pattern);
        const keysToDelete = keys.filter(key => regex.test(key));
        return this.cache.del(keysToDelete);
    }
}

// Exporta instância única (Singleton)
export const cacheService = new CacheService();
