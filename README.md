<div align="center">
  <img src="public/logo.png" alt="Bingo Party Logo" width="300" style="border-radius: 20px; box-shadow: 0 10px 30px rgba(251,191,36,0.3); margin-bottom: 20px;" />
  
  # 🎱 Bingo Party — Premium Edition
  
  **¡La experiencia definitiva de Bingo multijugador online!**
  
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](#)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#)

  *Crea una sala, invita hasta a 6 amigos escaneando un código QR, y disfruta de una noche de casino sin salir de casa.*
</div>

---

## ✨ Características Principales

<table>
  <tr>
    <td width="50%">
      <h3>🎰 Tema de Casino Premium</h3>
      <p>Interfaz renovada con efectos <i>glassmorphism</i>, paleta de colores lujosa (dorados, esmeraldas y rubíes), y tipografía elegante.</p>
    </td>
    <td width="50%">
      <h3>📱 Multidispositivo</h3>
      <p>Totalmente responsivo. Juega desde tu Smart TV (como Host) mientras tus amigos marcan sus cartones desde sus teléfonos.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>⚡ Sincronización en Tiempo Real</h3>
      <p>Cero retrasos. Las bolas cantadas, los marcados de cartón y el estado del juego se sincronizan instantáneamente mediante Firebase.</p>
    </td>
    <td width="50%">
      <h3>🎯 Verificación Automática</h3>
      <p>El sistema verifica automáticamente los patrones al cantar BINGO. Si el jugador se equivoca o marca un número incorrecto, es penalizado.</p>
    </td>
  </tr>
</table>

---

## 📖 Reglas del Juego

El juego se basa en el **Bingo clásico americano de 75 bolas**. ¡Presta mucha atención a tu cartón!

### 1️⃣ Tu Cartón de Bingo
- Cada jugador recibe un cartón de **5x5** con un estilo visual impresionante.
- La casilla central es un **⭐ Espacio Libre** y ya viene marcada.
- Los números están ordenados por columnas:
  - 🟣 **B:** 1 al 15
  - 🔵 **I:** 16 al 30
  - 🟡 **N:** 31 al 45
  - 🟢 **G:** 46 al 60
  - 🔴 **O:** 61 al 75

### 2️⃣ El Sorteo (Host)
- El Host de la sala hará girar la ruleta, la cual proyectará las animaciones con la bola actual (ej: **G 54**).
- El sorteo puede ser **Manual** o **Automático** (cada ciertos segundos).

### 3️⃣ Marcado Manual (Jugador)
- Cuando el Host canta un número, **toca la casilla en tu cartón** para marcarla. Verás aparecer un sello **✓**.
- Usa el panel de **Números Llamados** a tu derecha para revisar el historial completo de bolas que ya han salido.

### 4️⃣ Patrones de Victoria
Antes de iniciar, el Host configura cuál es la figura necesaria para ganar:

> 🟩 **Línea:** 5 casillas seguidas (Horizontal o Vertical). <br/>
> 🟩 **Diagonal:** Línea cruzada de extremo a extremo. <br/>
> 🟩 **Cuatro Esquinas:** Solo las 4 esquinas del cartón. <br/>
> 🟩 **X:** Ambas diagonales formando una X. <br/>
> 🟩 **Cartón Lleno (Blackout):** Marcar las 25 casillas completas. <br/>

### 5️⃣ ¡Cantar BINGO!
Cuando completes el patrón activo, presiona el botón dorado gigante **¡BINGO!**.

> ⚠️ **¡CUIDADO CON LAS FALSAS ALARMAS!** ⚠️  
> Si cantas Bingo pero tu patrón está incompleto o marcaste un número que no ha salido, serás **eliminado** de la partida. ¡Revisa bien antes de gritar!
