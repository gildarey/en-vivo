# En Vivo

Página para ver varios canales paraguayos de YouTube en vivo al mismo tiempo, en una sola pantalla.

## Objetivo

Seguir cómo avanza el caso Ueno Bank desde un solo lugar, sin saltar entre pestañas.
No pretende ser comercializado.

## Cómo usarlo

Abrir `index.html` en el navegador.

- **Pantallas:** botones `1 · 2 · 4 · 6` en el header para elegir cuántos cuadros ver.
- **Canal por cuadro:** cada cuadro tiene un desplegable para elegir qué canal muestra.
- **Audio:** 🔇/🔊 en cada cuadro, o las teclas `1`–`6`. El cuadro con audio queda marcado en verde.
- **Recargar:** ↻ en cada cuadro, o ↻ Todo.
- **Tecla `H`:** oculta o muestra el header.

El diseño y los canales elegidos quedan guardados en ese navegador.

## Agregar un canal

En `index.html`, sumar una línea a la lista `CHANNELS` con el nombre y el `channelId` del canal de YouTube.
Si el directo del canal no carga, se puede poner el `videoId` del directo puntual.

## Notas

- Los anuncios de YouTube no se pueden saltar desde la página: el reproductor es de YouTube y la página no puede controlarlo por dentro.
- Recargar un cuadro suele mostrar un anuncio de entrada; conviene no recargar seguido.
