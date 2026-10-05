# Cómo editar la tienda sin subir zips

Desde ahora el tema vive en GitHub y en Shopify al mismo tiempo. **Los dos están conectados**:

- Lo que cambias en **GitHub** (en la rama conectada) se actualiza solo en Shopify.
- Lo que cambias en el **editor de Shopify** (Personalizar o Editar código) se guarda solo en GitHub, con un mensaje de «Shopify».

Resultado: no hay que subir zips. Editas en cualquiera de los dos lugares.

## Las dos ramas

- `dev` = tema de pruebas. Aquí cambias y pruebas sin riesgo.
- `main` = la tienda en vivo. Solo pasa a `main` lo que ya probaste.

Para pasar de `dev` a `main`: en GitHub entra a tu repositorio → **Pull requests** → **New pull request**
→ base: `main`, compare: `dev` → **Create pull request** → **Merge pull request**.
Al unirlo, la tienda en vivo se actualiza sola.

## Qué se cambia dónde

| Quiero cambiar... | Dónde |
|---|---|
| Textos del inicio, diapositivas, categorías, combos, preguntas frecuentes, recetas de jugos, fotos | Shopify → Tienda online → Temas → **Personalizar** (es lo más fácil) |
| Logo, colores, WhatsApp, TikTok, Instagram, razón social, NIT, dirección, correo, texto de pagos | Personalizar → **Configuración del tema** |
| Preguntas y destinos de la guía «¿Te ayudo a elegir?» | GitHub: `assets/advisor.js` (bloque `TREE`) |
| Textos legales (términos, privacidad, envíos, garantías, PQR, cookies, aviso +18) | GitHub: `snippets/legal-...liquid`, o pega el texto final en la página de Shopify (reemplaza al borrador) |
| Tamaños de letra, espacios, colores finos | GitHub: `assets/styles.css` |
| Productos, colecciones, menús, páginas, inventario, tallas | Panel de Shopify (no son parte del tema) |

## Cómo editar un archivo en GitHub (desde el celular)

1. Entra a tu repositorio y cambia a la rama `dev` (menú de ramas, arriba a la izquierda).
2. Abre la carpeta y el archivo.
3. Toca el lápiz (**Edit this file**).
4. Haz el cambio.
5. Toca **Commit changes**, deja marcada la rama `dev` y confirma.
6. En 1 o 2 minutos el tema de `dev` en Shopify ya tiene el cambio. Míralo con **Vista previa**.

## Cuidados

- **No edites el mismo archivo en GitHub y en Shopify al mismo tiempo.** Si ocurre, pueden chocar los cambios. Termina en un lugar, espera un minuto y sigue en el otro.
- Cada archivo del tema pesa máximo 5 MB, y el tema completo máximo 50 MB.
- Si desconectas una rama del tema, no se puede volver a conectar: Shopify la crea como un tema nuevo.
- Carpetas como `docs`, `README.md` o `.github` no afectan a Shopify. Son solo para ti.
- Antes de cambios grandes, haz primero el cambio en `dev`, pruébalo y solo entonces pásalo a `main`.

## Primera vez: subir el tema completo

Solo se hace una vez. Hay dos formas:

**A. Arrastrando archivos (computador).** Descomprime `69sexshop-tema-COMPLETO.zip`. En GitHub, rama `dev`: **Add file → Upload files**
y arrastra el CONTENIDO de la carpeta (las carpetas `assets`, `config`, `layout`, `sections`, `snippets`, `templates`, `docs` y el `README.md`),
no la carpeta que las contiene ni el zip. Después borra en GitHub el archivo `assets/theme.css.liquid` si existe.

**B. Subiendo un solo zip (celular).** GitHub no permite subir carpetas desde el celular, pero sí un archivo. Para eso:
1. En la rama `dev` crea el archivo `.github/workflows/instalar-zip.yml` (**Add file → Create new file**; escribe esa ruta completa en el nombre)
   y pega el contenido de `docs/instalar-zip.yml.txt`. Guarda con **Commit changes**.
2. **Add file → Upload files** y sube `69sexshop-tema-COMPLETO.zip` a la raíz de la rama `dev`.
3. Entra a la pestaña **Actions**: verás «Instalar tema desde un zip». Cuando termine (marca verde), el zip se descomprime solo y el tema queda en el repositorio.
4. Borra `assets/theme.css.liquid` si existe.

## Revisor automático (opcional)

Crea `.github/workflows/theme-check.yml` con el contenido de `docs/theme-check.yml.txt`. En cada cambio GitHub revisa que no haya errores de código del tema.
