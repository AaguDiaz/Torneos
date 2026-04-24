# ⚽ Torneos — Generador de Torneos de Fútbol

Aplicación web para crear y gestionar torneos de fútbol de forma rápida, sin registro ni internet extra. Funciona directo desde el navegador.

**Link:** https://aagudiaz.github.io/Torneos/

---

## ¿Qué puede hacer?

- Crear torneos en formato **Copa** (bracket eliminatorio) o **Liga** (todos contra todos)
- Ingresar resultados partido a partido
- Ver tabla de posiciones actualizada en tiempo real
- Guardar el historial de torneos anteriores (en tu dispositivo)
- Funciona en celular y computadora

---

## Cómo usar

### 1. Crear un torneo

1. Ingresá un nombre para el torneo (opcional)
2. Elegí el formato: **Copa** o **Liga**
3. Configurá las opciones (tipo de copa, ida/vuelta, etc.)
4. Elegí la cantidad de equipos y escribí los nombres
5. Hacé clic en **Generar torneo**

---

## Formato Copa (bracket eliminatorio)

Los equipos se enfrentan en rondas eliminatorias. El perdedor queda afuera. El ganador avanza hasta la final.

### Tipos de Copa
| Tipo | Descripción |
|------|-------------|
| 🏆 Libertadores | Copa Libertadores de América |
| 🏆 Champions | UEFA Champions League |
| 🌍 Mundial | Copa del Mundo FIFA |

### Opciones de clasificación (cuando el número de equipos no es potencia de 2)
| Opción | Descripción |
|--------|-------------|
| **Byes aleatorios** | Algunos equipos avanzan automáticamente a la 2ª ronda sin jugar. Se sortea quiénes descansan. |
| **Fase especial (triangular)** | Los equipos "sobrantes" juegan un mini grupo de 3 equipos. El ganador de ese grupo se une al bracket principal. |

### Cómo ingresar un resultado (Copa)
1. Hacé clic en el partido con el botón **▶** (solo los partidos disponibles se pueden clickear)
2. Ajustá el marcador con los botones **+** y **−**
3. Si hay empate en Copa, elegí el ganador por penales
4. Confirmá con ✓

El ganador avanza automáticamente al siguiente partido del bracket.

---

## Formato Liga (todos contra todos)

Todos los equipos se enfrentan entre sí. Se acumulan puntos:
- **Victoria:** 3 puntos
- **Empate:** 1 punto
- **Derrota:** 0 puntos

### Opciones
| Opción | Descripción |
|--------|-------------|
| **Solo ida** | Cada par de equipos se enfrenta una sola vez |
| **Ida y vuelta** | Se juegan dos partidos entre cada par (local y visitante alternado) |

### Tabla de posiciones
Los equipos se ordenan por:
1. Puntos (mayor primero)
2. Diferencia de gol en caso de empate
3. Goles a favor como segundo desempate

La columna **Forma** muestra los últimos 5 resultados: **G** (ganó), **E** (empató), **P** (perdió).

### Cómo ingresar un resultado (Liga)
1. Ir a la pestaña **Jornadas**
2. Seleccionar la jornada deseada (por defecto va a la próxima jornada sin jugar)
3. Hacer clic en **▶ Jugar** en el partido
4. Ingresar el marcador y confirmar

---

## Historial de torneos

La app guarda automáticamente los torneos en tu dispositivo (localStorage del navegador). No se envía nada a internet.

- Al hacer clic en **Nuevo torneo** desde una copa o liga, te pregunta si querés guardar el torneo actual en el historial.
- Accedé al historial desde el botón **📋 Historial** en la pantalla principal.
- Desde el historial podés **restaurar** cualquier torneo guardado o **eliminarlo**.
- Se guardan hasta 30 torneos.

> **Nota:** el historial se guarda en el navegador. Si borrás los datos del navegador, se pierden. No se sincronizan entre dispositivos.

---

## Idioma

Hacé clic en el botón **EN / ES** (arriba a la derecha) para cambiar entre español e inglés.

---

## Estructura del proyecto

```
index.html          → Entrada principal (GitHub Pages)
copas/
  lib.png           → Trofeo Copa Libertadores
  champ.png         → Trofeo Champions League
  mundi.png         → Trofeo Copa del Mundo
js/
  utils.js          → Lógica de torneos (sin dependencias)
  trophies.jsx      → Componente Trophy (imagen PNG)
  modal.jsx         → Modal para ingresar resultados
  history.jsx       → Pantalla de historial
  setup.jsx         → Pantalla de configuración inicial
  copa.jsx          → Vista del bracket (Copa)
  liga.jsx          → Vista de tabla y jornadas (Liga)
  app.jsx           → Root de la app, manejo de estado global
```

---

## Tecnología

- **React 18** vía CDN (sin build step ni npm)
- **Babel Standalone** para JSX en el navegador
- **localStorage** para persistencia local
- Estilos inline en JS (sin CSS externo)
- Compatible con GitHub Pages sin configuración adicional
