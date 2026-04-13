# Frontend Global Standards (TEDx)

Estas instrucciones aplican por defecto a cualquier tarea de frontend en este repositorio.

## Objetivo
- Mantener una experiencia premium, clara y coherente con la identidad TEDx.
- Priorizar conversion, legibilidad, accesibilidad y rendimiento sin degradar el diseno existente.
- Implementar mejoras reales y medibles, no solo cambios cosmeticos.

## Direccion Visual
- Estilo base: elegante, minimal y editorial con storytelling visual sobrio.
- Mantener jerarquia tipografica clara y espacios consistentes.
- Evitar efectos excesivos o animaciones decorativas sin funcion.
- Preservar el color TEDx y asegurar contraste AA minimo.

## Arquitectura de Componentes
- Favorecer componentes pequenos, cohesionados y reutilizables.
- Evitar duplicacion: extraer utilidades o bloques comunes cuando aparezcan patrones repetidos.
- Mantener nombres descriptivos y estructura de props simple.
- No introducir sobreingenieria ni abstracciones sin beneficio inmediato.

## Reglas de Implementacion UI
- Mobile-first por defecto.
- Verificar estados clave: loading, empty, error, hover, focus, disabled.
- Evitar cambios visuales que rompan el look actual salvo requerimiento explicito.
- Si se propone una mejora fuera de alcance, implementarla solo si es segura y de alto impacto.

## SEO Tecnico (Next.js)
- Definir metadata en layout/paginas con title, description y canonical.
- Mantener Open Graph y Twitter Cards correctas para compartir.
- Incluir JSON-LD cuando aporte valor (Organization, WebSite, Event, FAQ).
- Garantizar estructura semantica: un solo h1 por pagina y headings en orden logico.

## Accesibilidad
- Usar landmarks semanticos (`header`, `nav`, `main`, `footer`) y labels utiles.
- Asegurar navegacion por teclado y estados de foco visibles.
- Usar texto alternativo descriptivo en imagenes relevantes.
- Respetar `prefers-reduced-motion` para animaciones.

## Performance
- Optimizar imagenes con `next/image` cuando sea viable.
- Reducir trabajo JS en cliente y evitar listeners globales innecesarios.
- Evitar recargas completas para navegacion interna.
- Cuidar CLS/LCP/INP con tamanos de medios definidos y recursos criticos optimizados.

## Criterio de Cambios
- Antes de editar: leer y entender lo existente.
- Al editar: minimo cambio efectivo, sin reformatear codigo no relacionado.
- Despues de editar: validar tipos/errores y revisar regresiones obvias.
- En cada entrega: incluir resumen breve de mejoras aplicadas y posibles siguientes pasos.