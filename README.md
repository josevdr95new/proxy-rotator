# ProxyRotator.js

Utilidad JavaScript para realizar peticiones HTTP resilientes utilizando una rotación de proxies públicos. Diseñado para evitar bloqueos de IP y superar restricciones de CORS en el desarrollo del lado del cliente, con reintentos automáticos, timeouts y una configuración sencilla.

**[➡️ Ver Demostración en Vivo](https://josevdr95new.github.io/proxy-rotator/)**

---

## ✨ Características Principales

- **Rotación Automática de Proxies:** Si una petición a través de un proxy falla, la librería intenta automáticamente con el siguiente proxy disponible en la lista, asegurando una alta tasa de éxito.
- **Reintentos Configurables:** Puedes definir cuántas veces la librería debe intentar realizar la petición antes de darse por vencida.
- **Timeout por Petición:** Establece un tiempo máximo de espera para cada intento, evitando que las peticiones se queden colgadas indefinidamente.
- **Modo de Proxy Fijo:** Si prefieres usar un único proxy, puedes configurarlo para que todas las peticiones pasen a través de él.
- **Helpers para JSON y Texto:** Incluye métodos de conveniencia como `.getJSON()` y `.getText()` para simplificar la obtención y procesamiento de los datos.
- **Modo Debug:** Activa logs detallados en la consola para monitorear el comportamiento de la librería en tiempo real.
- **Sin Dependencias:** Escrito en JavaScript puro, ligero y fácil de integrar en cualquier proyecto.

---

## 📋 Cómo Usar

### 1. Inclusión en tu Proyecto

Puedes incluir la librería directamente desde la URL pública en tu archivo HTML.

```html
<script src="https://josevdr95new.github.io/proxy-rotator/proxy-rotator.js"></script>
```

O, si lo prefieres, puedes descargar el archivo `proxy-rotator.js` y alojarlo localmente.

### 2. Uso Básico

Crear una instancia de `ProxyRotator` y usar sus métodos para realizar peticiones.

```javascript
// 1. Crear una instancia con la configuración deseada
const rotator = new ProxyRotator({
    retries: 3,       // Intentar hasta 3 veces
    timeout: 5000,    // 5 segundos de timeout por intento
    debug: true       // Mostrar logs en consola
});

// 2. Realizar una petición para obtener datos en formato JSON
rotator.getJSON('https://api.ipify.org?format=json')
    .then(data => {
        console.log('Tu IP pública es:', data.ip);
    })
    .catch(error => {
        console.error('La petición falló después de todos los intentos:', error);
    });

// O para obtener contenido como texto (HTML, texto plano, etc.)
rotator.getText('https://httpbin.org/html')
    .then(html => {
        console.log('HTML recibido:', html);
    })
    .catch(error => {
        console.error('No se pudo obtener el texto:', error);
    });
```

---

## 🛠️ Configuración Avanzada

Puedes personalizar el comportamiento de `ProxyRotator` pasando un objeto de opciones al constructor.

```javascript
const customRotator = new ProxyRotator({
    // Tu propia lista de proxies
    proxies: [
        'https://my-custom-proxy.com/?url=',
        'https://another-proxy.org/fetch?resource='
    ],

    // Número total de intentos antes de fallar
    retries: 5,

    // Timeout en milisegundos por cada intento
    timeout: 8000,

    // Forzar el uso de un proxy específico por su índice (ej. el primero de la lista)
    useProxyIndex: 0,

    // Desactivar los mensajes de depuración en la consola
    debug: false
});
```

### Opciones Disponibles

- `proxies` (Array de Strings): Un array con las URLs de los proxies que deseas utilizar. Si no se proporciona, se usará una lista interna por defecto.
- `retries` (Número): El número máximo de intentos para la petición. **Default: `3`**.
- `timeout` (Número): El tiempo en milisegundos que cada intento tiene antes de ser abortado. **Default: `5000`**.
- `useProxyIndex` (Número): Si se especifica un número, la librería usará únicamente el proxy en ese índice de la lista, deshabilitando la rotación. **Default: `null`**.
- `debug` (Booleano): Si es `true`, imprimirá información útil sobre los intentos y fallos en la consola. **Default: `false`**.

---

## 📜 Licencia

Este proyecto está distribuido bajo la **Licencia MIT**. Eres libre de usarlo, modificarlo y distribuirlo como consideres oportuno. Ver el archivo `LICENSE` para más detalles.
