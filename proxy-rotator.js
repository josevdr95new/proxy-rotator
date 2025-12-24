/**
 * ProxyRotator
 * * Utilidad para peticiones HTTP resilientes a través de proxies públicos.
 * Incluye reintentos automáticos, timeouts y helpers para JSON/Text.
 */
class ProxyRotator {
    constructor(options = {}) {
        // 1. Lista de Proxies (Editables)
        this.defaultProxies = [
            'https://corsproxy.io/?',
            'https://api.allorigins.win/raw?url=',
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://thingproxy.freeboard.io/fetch/',
            'https://corsproxy.org/',
            'https://test.cors.workers.dev/'
        ];

        // 2. Configuración (Con valores por defecto inteligentes)
        this.proxies = options.proxies || this.defaultProxies;
        this.timeout = options.timeout || 5000;      // 5 segundos máx por intento
        this.retries = options.retries || 3;         // Intentos totales antes de fallar
        this.debug = options.debug || false;         // Ver logs en consola
        
        // Si se define, usa SOLO este índice (0, 1, 2...)
        this.fixedIndex = (options.useProxyIndex !== undefined && options.useProxyIndex !== null) 
                          ? parseInt(options.useProxyIndex) 
                          : null;
    }

    /**
     * Log interno para depuración
     */
    _log(msg, type = 'info') {
        if (!this.debug) return;
        const prefix = `[ProxyRotator]`;
        if (type === 'error') console.error(prefix, msg);
        else if (type === 'warn') console.warn(prefix, msg);
        else console.log(prefix, msg);
    }

    /**
     * Construye la URL final detectando el formato del proxy
     */
    buildUrl(proxy, targetUrl) {
        if (proxy.includes('{url}')) return proxy.replace('{url}', encodeURIComponent(targetUrl));
        if (proxy.includes('?url=') || proxy.includes('?quest=') || proxy.endsWith('?')) {
            return `${proxy}${encodeURIComponent(targetUrl)}`;
        }
        return proxy + targetUrl;
    }

    /**
     * Método principal: FETCH con rotación
     */
    async fetch(url, options = {}) {
        let attempts = 0;
        
        // Si hay índice fijo, creamos una lista de 1 solo elemento. Si no, copiamos todos.
        let candidates = (this.fixedIndex !== null) 
            ? [this.proxies[this.fixedIndex]] 
            : [...this.proxies];

        if (!candidates[0]) throw new Error(`El proxy índice ${this.fixedIndex} no existe.`);

        while (attempts < this.retries && candidates.length > 0) {
            const currentProxy = candidates[0]; // Siempre probamos el primero de la lista actual
            const finalUrl = this.buildUrl(currentProxy, url);
            
            // Controlador de Timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            try {
                this._log(`Intento ${attempts + 1}/${this.retries} vía: ${currentProxy}`);

                const response = await fetch(finalUrl, {
                    ...options,
                    signal: controller.signal,
                    headers: {
                        ...options.headers // Mantener headers del usuario
                    }
                });

                clearTimeout(timeoutId);

                if (!response.ok) throw new Error(`HTTP Status ${response.status}`);
                
                this._log(`¡Éxito con ${currentProxy}!`);
                return response;

            } catch (error) {
                clearTimeout(timeoutId);
                this._log(`Fallo (${error.message})`, 'warn');

                // Si NO es modo fijo, quitamos el proxy que falló y el siguiente intento usará el siguiente
                if (this.fixedIndex === null) {
                    candidates.shift(); 
                    // Si se acaban los proxies pero quedan intentos, recargamos la lista
                    if (candidates.length === 0 && attempts < this.retries) {
                         candidates = [...this.proxies];
                    }
                }
                
                attempts++;
            }
        }
        throw new Error(`Fallaron todos los intentos (${attempts})`);
    }

    // --- Helpers de Utilidad (Para escribir menos código) ---

    /** Obtiene directamente el JSON de la URL */
    async getJSON(url, options = {}) {
        const res = await this.fetch(url, options);
        return await res.json();
    }

    /** Obtiene directamente el Texto/HTML de la URL */
    async getText(url, options = {}) {
        const res = await this.fetch(url, options);
        return await res.text();
    }
}

// Exportación universal
if (typeof module !== 'undefined' && module.exports) module.exports = ProxyRotator;
else window.ProxyRotator = ProxyRotator;
