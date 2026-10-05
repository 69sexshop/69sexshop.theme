# 69 SEXSHOP — Tema Shopify (v2.1)

Tema Online Store 2.0 sin compilación: Liquid + `assets/styles.css` + `assets/theme.js`.
Negro dominante, rojo solo como acento. Playfair Display + DM Sans.

## Cómo editar (sin zips)
Lee `docs/GUIA-EDITAR.md`. Resumen: el tema está conectado a GitHub y a Shopify en los dos sentidos. Edita directo en GitHub
(rama `dev`) o en el editor de Shopify, prueba en `dev` y pasa a `main` con un Pull Request cuando esté listo.

## Qué crear en Shopify para que todo funcione
**Menús** (Contenido → Menús): `main-menu`, `footer`, `legal`.
Si no existen, el tema usa enlaces por defecto.

**Colecciones** (con estos identificadores / handles; se enlazan desde el home):
`para-ella`, `para-el`, `parejas`, `lenceria`, `lubricantes`,
`combos`, `mas-deseados`, `novedades`, `primera-vez`, `estimulacion`.
Recomendado: colecciones automáticas por etiqueta (audiencia + intención + tipo).

**Páginas** (Contenido → Páginas):
- `favoritos` (el corazón del header lleva aquí; el tema muestra la lista solo, sin plantilla especial).
- `contacto` (el tema muestra un formulario solo), `envios`, `pqr`, `terminos`, `privacidad`, `retracto-y-devoluciones`, `garantias`, `cookies`, `aviso-18`.
  Páginas legales: crea cada página con ese identificador (handle) y déjala SIN contenido; el tema muestra
  el borrador (snippets/legal-*.liquid). Lo resaltado en amarillo está pendiente. Un abogado debe revisarlo
  todo antes de abrir la tienda. Si escribes contenido en la página de Shopify, reemplaza el borrador.

**Personalizar tema → Configuración del tema**: logo, colores, WhatsApp, redes y datos legales
(razón social, NIT, dirección, correo). Solo se muestra lo que llenes.

## Archivos
layout/theme.liquid · sections/ (announcement, header, footer, hero-69, categories-69, featured-products, combos-69,
trust-69, finder-69, story-69, faq-69, main-product-69, main-collection-69, main-search-69, main-cart-69,
main-favorites-69, main-page-69, main-404-69) · snippets/ (icon, cart-drawer, age-gate, advisor, product-card) ·
templates/*.json · assets/ (styles.css, theme.js, advisor.js, logo.png, 69-logo.jpg) · config/.

## Preguntas frecuentes y «Síguenos»
La sección de preguntas frecuentes está en el home (editable desde el editor: cada pregunta es un bloque).
Revisa que las respuestas coincidan con tus políticas reales. La franja «Síguenos» del pie muestra
Instagram, TikTok y WhatsApp según los enlaces que llenes en Configuración del tema.

## Menú superior (catálogos)
Las categorías se ven siempre arriba, debajo del logo si la pantalla es angosta (se deslizan de lado si no caben).
Si en Shopify creaste el menú `main-menu`, el tema usa ese menú: ahí debes quitar o agregar enlaces (por ejemplo «Bienestar»).

## Deslizador de inicio
Primera sección del inicio: hasta 6 diapositivas con foto de fondo, título, texto y dos botones. Cambia sola cada 6 segundos
(se puede ajustar o apagar), se desliza con el dedo, y tiene puntos, flechas y botón de pausa.

## Jugos afrodisiacos (recetas)
Sección interactiva con 4 recetas: pestañas, porciones que recalculan los ingredientes, ingredientes que se marcan y botón
«Compartir receta». Cada receta puede mostrar un producto de la tienda (elígelo en el editor, en el bloque de la receta); si no,
muestra un botón a una colección. Ingredientes: una línea por ingrediente con el formato cantidad|unidad|ingrediente (para 2 porciones).
Son recetas de bebidas: no prometas efectos de salud en los textos.

## Descripción y modo de uso del producto
La descripción sale del texto del producto. El «Modo de uso» sale de un metacampo: en Shopify → Configuración → Datos personalizados →
Productos → Agregar definición → nombre «Modo de uso», clave `custom.modo_de_uso`, tipo texto de varias líneas. Luego llénalo en cada producto
(sección Metacampos). Si un producto no lo tiene, esa parte no se muestra.

## Tallas (lencería) y otras opciones
Shopify NO crea las tallas solo: en cada producto de lencería agrega la opción «Talla» con los valores S, M y L
(Producto → Variantes → Agregar opciones). Cada talla puede tener su propio inventario y precio.
El tema las muestra como botones; si una talla se agota, aparece tachada y ofrece «Encargar producto».
Si creas una página con la guía de tallas, elígela en el editor (sección «Producto 69») y aparece el enlace «Guía de tallas».
Para filtrar lencería por talla en la colección, activa el filtro «Talla» en la app Search & Discovery.

## Guía de preguntas: cada opción va directo
Cada opción lleva directo a su colección o página (editable en `assets/advisor.js`). Si la colección aún no existe,
la guía (y los enlaces del home y del pie) llevan a «Todos los productos» en vez de dar error 404.
«Tengo una duda» abre un segundo nivel (envíos, cambios, preguntas frecuentes, hablar con una persona).

## Encargar producto (sin existencias)
Cuando un producto o una opción está agotada, la página del producto cambia el botón por «Encargar producto»
y muestra un formulario (nombre, teléfono, correo, cantidad, nota) y un botón de WhatsApp con el producto ya escrito.
El formulario llega al correo de contacto de tu tienda (Shopify → Configuración → Notificaciones).
Los productos agotados se marcan «Por encargo» en las tarjetas. Los textos se editan en el editor, en la sección «Producto 69».
Si vendes bajo pedido, activa en el producto «Continuar vendiendo cuando no haya existencias»: el botón dirá «Encargar».

## Pagos con Wompi
Se configuran en Shopify, no en el tema: Configuración → Pagos → Wompi (guía oficial: docs.wompi.co/docs/colombia/wompi-shopify-plugin).
El texto «Pagos seguros con Wompi» del pie se cambia en Configuración del tema → Pagos.

## Filtros de colección
La página de colección muestra filtros y orden. Los filtros salen de la app gratuita **Shopify Search & Discovery**
(Aplicaciones → Search & Discovery → Filtros): agrega «Etiqueta de producto» (tipo), «Disponibilidad» y «Precio».

## Guía de preguntas (abajo a la izquierda)
Árbol de preguntas en `assets/advisor.js` (objeto `TREE`): cambia textos y destinos ahí.
Se apaga desde Configuración del tema → «Mostrar la guía de preguntas». Los finales llevan a las colecciones
y páginas listadas arriba; con WhatsApp configurado, el mensaje sale con el recorrido del cliente.

## Pendiente (no incluido)
Fotos propias, páginas legales revisadas por abogado, pasarela de pago apta para adultos,
filtros por tipo/entrega, blog de guías, reseñas verificadas, Modo discreto.
