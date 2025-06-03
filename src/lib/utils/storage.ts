/**
 * Wrapper para localStorage con manejo de errores y serialización automática
 */
export const localStorage = {
  /**
   * Guarda un valor en localStorage
   */
  set: <T>(key: string, value: T): boolean => {
    try {
      const serializedValue = JSON.stringify(value);
      window.localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
      return false;
    }
  },

  /**
   * Obtiene un valor de localStorage
   */
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return defaultValue || null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error al leer de localStorage:', error);
      return defaultValue || null;
    }
  },

  /**
   * Elimina un valor de localStorage
   */
  remove: (key: string): boolean => {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error al eliminar de localStorage:', error);
      return false;
    }
  },

  /**
   * Limpia todo el localStorage
   */
  clear: (): boolean => {
    try {
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error al limpiar localStorage:', error);
      return false;
    }
  },

  /**
   * Verifica si una clave existe en localStorage
   */
  exists: (key: string): boolean => {
    try {
      return window.localStorage.getItem(key) !== null;
    } catch (error) {
      console.error('Error al verificar localStorage:', error);
      return false;
    }
  },

  /**
   * Obtiene todas las claves de localStorage
   */
  keys: (): string[] => {
    try {
      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) keys.push(key);
      }
      return keys;
    } catch (error) {
      console.error('Error al obtener claves de localStorage:', error);
      return [];
    }
  },
};

/**
 * Wrapper para sessionStorage con manejo de errores y serialización automática
 */
export const sessionStorage = {
  /**
   * Guarda un valor en sessionStorage
   */
  set: <T>(key: string, value: T): boolean => {
    try {
      const serializedValue = JSON.stringify(value);
      window.sessionStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Error al guardar en sessionStorage:', error);
      return false;
    }
  },

  /**
   * Obtiene un valor de sessionStorage
   */
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = window.sessionStorage.getItem(key);
      if (item === null) {
        return defaultValue || null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error al leer de sessionStorage:', error);
      return defaultValue || null;
    }
  },

  /**
   * Elimina un valor de sessionStorage
   */
  remove: (key: string): boolean => {
    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error al eliminar de sessionStorage:', error);
      return false;
    }
  },

  /**
   * Limpia todo el sessionStorage
   */
  clear: (): boolean => {
    try {
      window.sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Error al limpiar sessionStorage:', error);
      return false;
    }
  },

  /**
   * Verifica si una clave existe en sessionStorage
   */
  exists: (key: string): boolean => {
    try {
      return window.sessionStorage.getItem(key) !== null;
    } catch (error) {
      console.error('Error al verificar sessionStorage:', error);
      return false;
    }
  },

  /**
   * Obtiene todas las claves de sessionStorage
   */
  keys: (): string[] => {
    try {
      const keys: string[] = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key) keys.push(key);
      }
      return keys;
    } catch (error) {
      console.error('Error al obtener claves de sessionStorage:', error);
      return [];
    }
  },
};

/**
 * Verifica si localStorage está disponible
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    window.localStorage.setItem(test, 'test');
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Verifica si sessionStorage está disponible
 */
export const isSessionStorageAvailable = (): boolean => {
  try {
    const test = '__sessionStorage_test__';
    window.sessionStorage.setItem(test, 'test');
    window.sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Obtiene el tamaño usado de localStorage en bytes (aproximado)
 */
export const getLocalStorageSize = (): number => {
  try {
    let total = 0;
    for (let key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        total += window.localStorage[key].length + key.length;
      }
    }
    return total;
  } catch {
    return 0;
  }
};

/**
 * Obtiene el tamaño usado de sessionStorage en bytes (aproximado)
 */
export const getSessionStorageSize = (): number => {
  try {
    let total = 0;
    for (let key in window.sessionStorage) {
      if (window.sessionStorage.hasOwnProperty(key)) {
        total += window.sessionStorage[key].length + key.length;
      }
    }
    return total;
  } catch {
    return 0;
  }
};

/**
 * Crea un storage temporal en memoria cuando localStorage no está disponible
 */
export const createMemoryStorage = () => {
  const storage: Record<string, string> = {};

  return {
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    getItem: (key: string) => {
      return storage[key] || null;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      for (const key in storage) {
        delete storage[key];
      }
    },
    get length() {
      return Object.keys(storage).length;
    },
    key: (index: number) => {
      const keys = Object.keys(storage);
      return keys[index] || null;
    },
  };
};

/**
 * Storage universal que funciona tanto en cliente como servidor
 */
export const createUniversalStorage = () => {
  const isClient = typeof window !== 'undefined';
  const hasLocalStorage = isClient && isLocalStorageAvailable();
  
  if (hasLocalStorage) {
    return window.localStorage;
  }
  
  return createMemoryStorage();
}; 