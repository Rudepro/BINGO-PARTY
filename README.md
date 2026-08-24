# 🎱 Bingo Party - Multijugador Online

Juego de Bingo americano (75 bolas) multijugador en tiempo real. Construido con React, Vite y Firebase.

## Características

- 🎮 **Multijugador en tiempo real**: Hasta 6 jugadores por sala.
- 📱 **Mobile First**: Diseño responsivo optimizado para móviles (jugadores) y tablets/PC (anfitrión).
- 🎨 **Estilo Casino**: Diseño visual vibrante con animaciones y soporte para modo oscuro.
- 🛠️ **Host Interactivo**: El anfitrión (Host) tiene una vista especial con ruleta animada, historial de bolas y panel de control.
- 🏁 **Verificación Anti-trampas**: Validación centralizada de los cartones contra los patrones ganadores y el registro de bolas cantadas.
- 🏆 **Múltiples Patrones**: Soporte para patrones como Línea, Diagonal, Cuatro Esquinas, X, o Cartón Lleno (Blackout).
- 🔗 **Acceso Rápido**: Unión a la sala mediante código alfanumérico o escaneando un código QR.

## Arquitectura

- **Frontend**: React 18, Vite.
- **Estado Global**: Zustand.
- **Backend / Tiempo Real**: Firebase Firestore (Capa gratuita Spark).
- **Autenticación**: Firebase Anonymous Auth (sin login necesario).
- **Despliegue**: GitHub Pages (vía GitHub Actions).

## Requisitos Previos

- Node.js v18+ y npm
- Un proyecto de Firebase (ver la [Guía de Configuración](FIREBASE-SETUP.md))

## Configuración Local

1. Clona el repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz del proyecto usando `.env.example` como referencia. Llena las variables con las credenciales de tu proyecto Firebase (ver `FIREBASE-SETUP.md`).
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Reglas de Firestore de Seguridad

Asegúrate de aplicar estas reglas en la consola de Firebase -> Firestore -> Reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;

      match /players/{playerId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && request.auth.uid == playerId;
      }
    }
  }
}
```

## Despliegue Automático

El despliegue a GitHub Pages está configurado a través de GitHub Actions en `.github/workflows/deploy.yml`.

Para que funcione, debes configurar los siguientes "Repository Secrets" en GitHub (Settings -> Secrets and variables -> Actions):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
