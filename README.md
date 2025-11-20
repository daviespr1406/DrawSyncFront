# DrawSync - Frontend

## Autores

- **David Espinosa** (daviespr1406)
- **Sara Castillo** (saracgarcia3)
- **Salomón Baena** (DSBAENAR)

---

## Descripción del Proyecto

DrawSync es un juego multijugador de dibujo y adivinanzas construido con React, TypeScript y WebSockets. Los jugadores pueden crear o unirse a salas de juego, dibujar en un lienzo compartido, chatear en tiempo real y comunicarse mediante chat de voz. La aplicación cuenta con un sistema de lobby, temporizadores sincronizados y actualizaciones en tiempo real entre todos los clientes conectados.

---

## Tecnologías Utilizadas

### Core
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - JavaScript con tipado estático
- **Vite** - Herramienta de construcción y servidor de desarrollo

### Estilos
- **TailwindCSS** - Framework CSS utility-first
- **Lucide React** - Biblioteca de iconos
- **Sonner** - Notificaciones toast

### Comunicación en Tiempo Real
- **@stomp/stompjs** - Protocolo STOMP para WebSocket
- **SockJS Client** - Soporte de respaldo para WebSocket

### Componentes UI
- **Radix UI** - Primitivos de componentes accesibles
  - Dialog
  - Dropdown Menu
  - Tooltip
  - Avatar
- **re-resizable** - Componentes redimensionables

### Comunicación de Voz
- **WebRTC** - Chat de voz peer-to-peer

---

## Funcionalidades Principales

### Gestión de Juegos
- **Crear Juego** - Iniciar una nueva sala con código único
- **Unirse a Juego** - Unirse a sala existente usando código
- **Sistema de Lobby** - Esperar jugadores antes de iniciar
- **Inicio Manual** - El creador controla cuándo comenzar
- **Pantalla de Fin de Juego** - Se muestra cuando expira el temporizador

### Dibujo
- **Lienzo en Tiempo Real** - Dibujo sincronizado entre todos los jugadores
- **Herramientas de Dibujo**:
  - Pluma, Marcador, Resaltador, Lápiz
  - Tamaño de pincel ajustable
  - Selector de color
  - Borrador
- **Barra de Herramientas Flotante** - Arrastrable y redimensionable

### Comunicación
- **Chat de Texto** - Mensajería en tiempo real por sala de juego
- **Chat de Voz** - Comunicación de voz basada en WebRTC
- **Alcance por Sala** - Toda comunicación aislada por sala

### Interfaz de Usuario
- **Diseño Responsivo** - Funciona en escritorio y móvil
- **Temas Modernos** - Diseño con glassmorphism moderno
- **Animaciones** - Transiciones suaves y micro-interacciones
- **Lista de Jugadores** - Ver todos los jugadores conectados
- **Visualización de Temporizador** - Cuenta regresiva para cada ronda

---

## Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes UI reutilizables (Radix)
│   ├── Dashboard.tsx   # Panel principal
│   ├── GameView.tsx    # Pantalla principal del juego
│   ├── GameLobby.tsx   # Sala de espera
│   ├── GameEndScreen.tsx # Pantalla de fin de juego
│   ├── GameHeader.tsx  # Encabezado con temporizador
│   ├── GameChat.tsx    # Componente de chat
│   ├── GameToolbar.tsx # Herramientas de dibujo
│   ├── DrawingCanvas.tsx # Componente de lienzo
│   ├── PlayersList.tsx # Barra lateral de jugadores
│   ├── CreateGameModal.tsx
│   ├── JoinGameModal.tsx
│   └── WelcomeScreen.tsx
├── hooks/              # Hooks personalizados de React
│   └── useVoiceChat.ts # Lógica de chat de voz WebRTC
├── services/           # Capa de servicios
│   └── WebSocketService.ts # Singleton de WebSocket
├── App.tsx             # Componente raíz
└── main.tsx           # Punto de entrada
```

---

## Instrucciones de Instalación

### Requisitos Previos
- Node.js 18+ y npm

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/daviespr1406/DrawSyncFront.git
   cd DrwSyncFront
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar URL del backend** (si es diferente de localhost:8080)
   
   Actualizar URL de WebSocket en `src/services/WebSocketService.ts`:
   ```typescript
   webSocketFactory: () => new SockJS('http://localhost:8080/ws')
   ```

4. **Ejecutar servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir navegador**
   
   Navegar a `http://localhost:3000` (o el puerto mostrado en terminal)

### Compilar para Producción

```bash
npm run build
```

Los archivos compilados estarán en el directorio `dist/`.

---

## Guía de Uso

1. **Pantalla de Bienvenida** - Ingresar nombre de usuario
2. **Panel Principal** - Elegir crear o unirse a un juego
3. **Crear Juego** - Obtener un código de juego único
4. **Lobby** - Compartir código con amigos, esperar jugadores
5. **Iniciar Juego** - El creador hace clic en "Iniciar Juego"
6. **Jugar** - Dibujar, chatear y adivinar
7. **Finalizar** - El temporizador expira, ver pantalla de fin

---

## Integración con API

El frontend se conecta al backend mediante:

### API REST
- `POST /api/games/create` - Crear nuevo juego
- `POST /api/games/join` - Unirse a juego existente
- `GET /api/games/{gameCode}` - Obtener estado del juego
- `POST /api/games/{gameCode}/start` - Iniciar juego

### Tópicos WebSocket
- `/topic/{gameCode}/chat` - Mensajes de chat
- `/topic/{gameCode}/draw` - Trazos de dibujo
- `/topic/{gameCode}/timer` - Actualizaciones del temporizador
- `/topic/{gameCode}/voice` - Señalización de voz

---

## Capturas de Pantalla

### Pantalla de Bienvenida


### Panel Principal


### Lobby del Juego


### Pantalla de Juego


### Chat y Herramientas de Dibujo


### Pantalla de Fin de Juego


---

## Desarrollo

### Scripts Disponibles

- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run preview` - Previsualizar compilación de producción
- `npm run lint` - Ejecutar ESLint

---

## Arquitectura de Componentes

### Diagrama de Componentes

**[Insertar diagrama de componentes aquí]**

### Flujo de Datos

**[Insertar diagrama de flujo de datos aquí]**

---

## Licencia

Este proyecto es desarrollado con fines educativos como parte del curso ARSW en la Escuela Colombiana de Ingeniería Julio Garavito.

---

## Contacto

Para consultas o contribuciones, contactar a los autores:
- David Espinosa: daviespr1406
- Sara Castillo: saracgarcia3
- Salomón Baena: DSBAENAR
