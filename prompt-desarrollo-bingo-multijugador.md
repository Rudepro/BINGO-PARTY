# PROMPT MAESTRO — Desarrollo de "Bingo Multijugador Online"

Copia y pega este prompt completo en tu herramienta de desarrollo (Claude, Cursor, v0, etc.) para generar el proyecto.

---

## 1. CONTEXTO Y OBJETIVO

Quiero que desarrolles un **juego de Bingo multijugador en tiempo real**, jugable desde varios dispositivos (hasta **6 jugadores** por sala), usando un **código de sala** para conectarse, desplegable de forma **100% gratuita** en **GitHub Pages** (frontend estático) combinado con un backend gratuito de tiempo real (ver sección 4).

El juego debe basarse en las **reglas reales del Bingo americano de 75 bolas**, replicando fielmente la distribución numérica y la mecánica de canto de "¡BINGO!" con verificación anti-trampas.

---

## 2. REGLAS OFICIALES A RESPETAR (Bingo de 75 bolas)

Investiga y aplica estas reglas como base del motor de juego:

- El cartón (tarjeta) es una cuadrícula de **5x5** encabezada por las letras **B - I - N - G - O**.
- Cada columna solo puede contener números de un rango fijo:
  - **B: 1–15**
  - **I: 16–30**
  - **N: 31–45** (la celda central es **"Espacio Libre" / FREE**, ya marcada desde el inicio)
  - **G: 46–60**
  - **O: 61–75**
- Cada columna tiene **5 números únicos y aleatorios** dentro de su rango (sin repetirse dentro de la misma tarjeta).
- No pueden existir números repetidos entre columnas de una misma tarjeta, ni tarjetas idénticas entre sí para distintos jugadores en la misma sala.
- El sorteo extrae 75 bolas únicas (numeradas 1–75) sin reposición, en orden aleatorio, mostrando la letra correspondiente al rango (ej. "G 54").
- Existen distintos **patrones de victoria** ("modos de juego") que deben poder configurarse antes de iniciar la partida:
  1. **Línea horizontal** (cualquiera de las 5 filas).
  2. **Línea vertical** (cualquiera de las 5 columnas).
  3. **Diagonal** (cualquiera de las 2 diagonales).
  4. **Cuatro esquinas**.
  5. **Patrón en X**.
  6. **Cartón lleno / Blackout** (las 25 casillas, como en la imagen de referencia "Tarjeta completa").
  7. (Opcional/expandible) Patrones personalizados en forma de letra o figura, definidos como una matriz booleana 5x5.

---

## 3. FUNCIONALIDADES REQUERIDAS

### 3.1 Flujo de inicio
1. **Pantalla principal** con dos opciones:
   - "1. Crear Sala" (host)
   - "2. Unirse a una Sala" (jugador)
2. **Carrusel de reglas** (pop-up tipo onboarding, deslizable/swipeable) que explica: distribución de números, cómo marcar, patrones de victoria disponibles, y cómo cantar Bingo. Debe poder omitirse ("Saltar") o navegarse con flechas/puntos indicadores.
3. Si elige **Crear Sala**:
   - Configura: número máximo de jugadores (2–6), número de cartones por jugador (1–3, configurable por el host), y el/los patrón(es) de victoria válidos para la partida.
   - Se genera un **código de sala único** (ej. 6 caracteres alfanuméricos) y un **QR opcional** para compartir.
   - El host pasa a la **vista de anfitrión** (sección 3.3).
4. Si elige **Unirse a una Sala**:
   - Ingresa el código de sala + su nombre/apodo.
   - Espera en un **lobby** hasta que el host inicie la partida.
   - Recibe su(s) cartón(es) generado(s) aleatoriamente y únicos.

### 3.2 Vista del jugador
- Se muestran sus 1–3 cartones (según configuración) simultáneamente, cada uno con:
  - **Color de marcado distinto por cartón** (para diferenciarlos visualmente: ej. cartón 1 = rojo, cartón 2 = azul, cartón 3 = amarillo), tal como en la imagen de referencia de tarjetas rojas/azules.
  - Casilla central "Espacio Libre" premarcada.
  - Marcado manual o automático (configurable) al cantarse cada número.
- **Tablero de números llamados**: grilla 1–75 estilo "carton maestro" (ver imagen de referencia con la letra grande "L" y "45/75 CALLED") que resalta en color los números ya sorteados, para que el jugador verifique fácilmente sus cartones.
- **Botón "¡BINGO!"** grande y visible, habilitado en cualquier momento.
- **Señalética del patrón activo**: un mini-diagrama 5x5 fijo en pantalla (ej. esquina superior) que muestra en tiempo real qué patrón hay que completar (línea, diagonal, X, cartón lleno, etc.) para ese modo de juego.
- Estado del jugador visible: activo / eliminado (por canto falso) / ganador.

### 3.3 Vista del anfitrión (Host)
- El host **no juega con cartones**; su pantalla es un **panel de control + espectáculo visual**:
  - **Animación de ruleta/bolillero** que gira y "extrae" la bola actual (imitar diseño de referencia: bola circular con letra + número, ej. "G 54").
  - Historial de las últimas bolas llamadas (ej. últimas 5, como en la imagen "Número de llamada 24").
  - Contador de progreso ("45/75 CALLED").
  - Lista de jugadores conectados con su estado (esperando, jugando, eliminado, ganador).
  - Botón para pausar/reanudar el sorteo automático o extraer bola manualmente.
  - Panel de alertas cuando un jugador canta "¡BINGO!", con el resultado de verificación (válido/inválido) en tiempo real.

### 3.4 Verificación anti-trampas
- Cuando un jugador presiona "¡BINGO!", el **servidor/lógica compartida** (nunca solo el cliente) debe:
  1. Congelar momentáneamente el sorteo.
  2. Verificar contra el registro real de bolas llamadas si el/los cartón(es) del jugador cumplen efectivamente el patrón de victoria configurado.
  3. Si es válido → se declara ganador, se muestra animación de victoria, y la partida puede finalizar o continuar según reglas (ej. "línea" primero, luego seguir por "cartón lleno").
  4. Si es inválido (trampa) → el jugador queda marcado como **"Eliminado"**, no puede volver a cantar Bingo, pero permanece observando hasta que termine la partida.
- Toda validación de victoria debe ejecutarse desde una **fuente de verdad única** (el estado de sala en el backend), nunca confiando en el estado local del cliente.

---

## 4. ARQUITECTURA TÉCNICA (para despliegue 100% gratuito)

GitHub Pages **solo sirve contenido estático**, por lo que la app necesita un servicio externo gratuito para la sincronización en tiempo real entre dispositivos. Evalúa y elige una de estas combinaciones (documenta la decisión):

| Capa | Opción recomendada | Alternativas gratuitas |
|---|---|---|
| Frontend estático | GitHub Pages | Netlify, Vercel, Cloudflare Pages |
| Tiempo real / estado de sala | **Firebase Realtime Database o Firestore** (capa gratuita) | Supabase Realtime, PartyKit, Colyseus (hosting propio en Render free tier) |
| Autenticación de sesión | Anónima (sin login), solo nombre + código de sala | Firebase Auth anónima |

**Recomendación concreta**: usar **Firebase (Firestore + Hosting o solo Firestore con GitHub Pages)** por su capa gratuita generosa, SDK bien documentado para JS puro o React, y porque resuelve sincronización de estado, listeners en tiempo real y reglas de seguridad (para blindar la verificación anti-trampas desde el servidor mediante **Cloud Functions** en el plan gratuito o mediante reglas de Firestore + lógica de verificación centralizada en el cliente del host, si se evita el plan de pago de Functions).

### 4.1 Arquitectura modular obligatoria

Estructura el proyecto en capas desacopladas, cada una testeable de forma independiente:

```
/src
  /core                     -> Lógica pura del juego (sin UI, sin red)
    cardGenerator.js         -> Genera cartones válidos (B/I/N/G/O + rangos + free space)
    numberCaller.js          -> Lógica del sorteo (75 bolas, sin reposición)
    patternValidator.js      -> Verifica patrones de victoria (línea, X, blackout, etc.)
    patterns.js              -> Definición de patrones como matrices 5x5 booleanas
    gameStateMachine.js      -> Máquina de estados: lobby -> playing -> paused -> finished

  /network                  -> Toda la comunicación en tiempo real
    roomService.js           -> Crear sala, generar código, unirse
    realtimeSync.js          -> Listeners/suscripciones al estado de la sala
    firebaseClient.js        -> Config e inicialización del SDK

  /state                    -> Manejo de estado de la app (Context API / Zustand / Redux)
    gameStore.js
    playerStore.js
    roomStore.js

  /components                -> UI desacoplada de la lógica
    /host
      RouletteAnimation.jsx
      BallHistory.jsx
      PlayersPanel.jsx
    /player
      BingoCard.jsx
      CalledNumbersBoard.jsx
      BingoButton.jsx
      PatternIndicator.jsx
    /shared
      RoomCodeDisplay.jsx
      RulesCarousel.jsx
      Lobby.jsx

  /screens                  -> Composición de pantallas/rutas
    HomeScreen.jsx
    CreateRoomScreen.jsx
    JoinRoomScreen.jsx
    HostGameScreen.jsx
    PlayerGameScreen.jsx

  /utils
    idGenerator.js           -> Generación de código de sala único
    colorPalette.js          -> Colores de marcado por cartón

  /assets                    -> Sonidos, íconos de pelotas, animaciones
  App.jsx
  main.jsx

/public
  index.html

firebase.json / firestore.rules
package.json
vite.config.js (recomendado Vite por velocidad de build para GitHub Pages)
```

**Principios de arquitectura a seguir:**
- **Separación estricta de capas**: `core/` no debe importar nada de `components/` ni `network/` (debe poder correr y testearse en Node puro).
- **Single source of truth**: el estado de la sala vive en el backend en tiempo real; los clientes solo reflejan (suscripción), nunca calculan el resultado final de una victoria por sí mismos.
- **Componentes reutilizables**: `BingoCard.jsx` debe aceptar props genéricas (`cardData`, `markedColor`, `calledNumbers`, `onCellClick`) para poder reusarse tanto en la vista del jugador con 1 cartón como con 3.
- **Diseño responsivo mobile-first**: la mayoría de jugadores usará celular; el host probablemente usará una pantalla más grande (TV/tablet/PC) para la animación de ruleta.

---

## 5. DISEÑO VISUAL / UX

- Paleta de colores vibrante tipo casino/juego casual (verde tablero, dorado para bolas, colores diferenciados por cartón: rojo, azul, amarillo — como en las imágenes de referencia).
- Bolas de sorteo circulares con la letra (B/I/N/G/O) arriba y el número grande al centro, con distinción de color por columna.
- Tablero maestro de números llamados (1–75) con la letra activa destacada en grande, y contador "X/75 CALLED" visible, replicando el estilo de referencia.
- Micro-animaciones: bola "cayendo" en la ruleta, destello al marcar número, confeti/sonido al ganar, "shake" o efecto de alerta al canto de Bingo inválido.
- Accesibilidad: tipografía grande y alto contraste para los números (juego pensado también para adultos mayores, público típico del Bingo).

---

## 6. REQUISITOS NO FUNCIONALES

- **Sin necesidad de instalar nada**: debe correr en el navegador (PWA opcional para "agregar a pantalla de inicio").
- **Reconexión**: si un jugador cierra o recarga la pestaña, al volver a entrar con el mismo código de sala + nombre debe recuperar su(s) cartón(es) y el estado del juego.
- **Manejo de desconexión del host**: definir comportamiento (pausar partida, transferir host, o cancelar sala tras X minutos de inactividad).
- **Límite de salas concurrentes** acorde a la capa gratuita del backend elegido.
- **Código de sala expira** tras un tiempo de inactividad para no acumular basura en la base de datos gratuita.

---

## 7. ENTREGABLES ESPERADOS DEL DESARROLLO

1. Repositorio con la estructura modular descrita en la sección 4.1.
2. Configuración lista para `npm run build` + despliegue automático a GitHub Pages (GitHub Actions con workflow `deploy.yml`).
3. Archivo `README.md` con instrucciones de:
   - Cómo configurar las credenciales del backend (Firebase u otro) mediante variables de entorno / `.env`.
   - Cómo correr en local.
   - Cómo desplegar.
4. Reglas de seguridad del backend (`firestore.rules` o equivalente) que impidan que un cliente modifique directamente el estado de "bolas llamadas" o declare victorias sin pasar por la validación central.
5. Documentación breve de los patrones de victoria disponibles y cómo agregar uno nuevo (para que el juego sea extensible a futuro).

---

## 8. INSTRUCCIÓN FINAL PARA LA IA DESARROLLADORA

Antes de escribir código, confirma o investiga si hace falta:
- La disponibilidad y límites actuales de la capa gratuita del backend en tiempo real elegido (Firebase/Supabase), ya que estos límites cambian con el tiempo.
- La compatibilidad de GitHub Actions + GitHub Pages para despliegue de una app Vite/React con variables de entorno privadas (usar GitHub Secrets).

Luego, genera el proyecto completo respetando exactamente la arquitectura modular, las reglas de Bingo de 75 bolas, y el flujo de pantallas descrito (Home → Crear/Unirse → Carrusel de reglas → Configuración → Código de sala → Lobby → Partida → Resultado).
