# En Vivo

Página para ver varios canales paraguayos de YouTube en vivo al mismo tiempo, en una sola pantalla.

## Objetivo

Seguir el juicio político desde un solo lugar, sin saltar entre pestañas.
Uso personal, sin fines comerciales.

## Cómo usarlo

Abrir `index.html` en el navegador.

- **Pantallas:** botones `1 · 2 · 4 · 6` en el header para elegir cuántos cuadros ver.
- **Canal por cuadro:** cada cuadro tiene un desplegable para elegir qué canal muestra.
- **Audio:** 🔇/🔊 en cada cuadro, o las teclas `1`–`6`. El cuadro con audio queda marcado en verde.
- **Recargar:** ↻ en cada cuadro, o ↻ Todo.
- **Pegar un link:** 🔗 en cada cuadro. Acepta solo links de YouTube (`youtube.com/watch?v=…`, `youtu.be/…`, `/live/…`). Vacío = vuelve al directo del canal. Se borra al cambiar de canal.
- **Abrir en YouTube:** ↗ arriba a la derecha de cada cuadro.
- **Agrandar:** ⛶ arriba a la derecha de cada cuadro muestra solo ese cuadro. ⛶ de nuevo o `Esc` para volver.
- **Tecla `H`:** oculta o muestra el header.
- **Enlaces:** en el pie, accesos a Senado, Diputados, SILpy (expedientes) y las webs de ABC, Última Hora y La Nación.

El diseño, los canales elegidos y los links pegados quedan guardados en ese navegador.

Si un canal no está transmitiendo, el cuadro muestra "No está transmitiendo" (solo cuando YouTube devuelve un error).

## Agregar un canal

En `app.js`, sumar una línea a la lista `CHANNELS` con el nombre y el `channelId` del canal de YouTube.

- `videoId` (opcional): se usa siempre en vez del directo del canal.
- `fallbackId` (opcional): se usa solo si el directo del canal da error, por ejemplo cuando el canal tiene dos directos a la vez. Caduca cuando ese directo termina.

## Notas

- Los videos se reproducen con el reproductor oficial de YouTube y pertenecen a sus canales. La página no aloja ni retransmite contenido.
- Los anuncios de YouTube no se pueden saltar desde la página: el reproductor es de YouTube y la página no puede controlarlo por dentro.
- Recargar un cuadro suele mostrar un anuncio de entrada; conviene no recargar seguido.
- Al agrandar un cuadro, los demás se descargan (no consumen internet). Al volver se recargan en vivo, y puede salir un anuncio de entrada.
