# 🥠 VTEX Fortune-Cookies Challenge

Este repositorio contiene la solución completa (Fases 1, 2 y 3) al **Challenge Técnico VTEX – “Galletas Chinas de la Fortuna”**.  
Incluye las tres apps pedidas, separadas en carpetas:
## ✨ Objetivo del proyecto

| Fase | Entregable | Descripción resumida |
|------|-----------|----------------------|
| **1** | **Store App** (`store/`) | • Renderiza un botón y dos labels (h3 y h5).<br>• Al hacer click trae una **frase aleatoria** desde la entidad **CF** de Master Data, la guarda en estado y muestra:<br> • `h3` → frase<br> • `h5` → número de la suerte en formato **XX-XX-XXXX**.<br>• Mientras carga muestra un spinner.<br>• Oculta los labels hasta tener datos. |
| **2** | **Landing Theme** (`theme/`) | • Crea una landing page para embedir el módulo de la Fase 1.<br>• Estiliza el módulo desde el *store theme* siguiendo **Mobile-First**.<br>• Incluye optimizaciones de CLS y uso de CSS Handles. |
| **3** | **Admin App** (`admin/`) | • Tabla con todos los registros de la entidad **CF**.<br>• Modal para **agregar** nuevas frases.<br>• Opción de **eliminar** registros.<br>• Feedback al usuario mediante toasts de `vtex.styleguide`<br>. https://cookiefortune--valtech.myvtex.com/admin/app/fortune-cookie |

---

## 🗃️ Estructura de carpetas

| Carpeta | Rol | Principales dependencias |
|---------|-----|--------------------------|
| `admin` | App de Admin (React + GraphQL + Styleguide) | `react`, `react-apollo`, `vtex.styleguide` |
| `store` | Custom Store App (módulo fortune-cookie) | `react`, `vtex.css-handles`, `vtex.styleguide` |
| `theme` | Store Theme clásico VTEX IO | `vtex.store`, `vtex.store-header`, etc. |

> Cada app tiene su propio `manifest.json` y puede **linkearse** individualmente con `vtex link`.

---






