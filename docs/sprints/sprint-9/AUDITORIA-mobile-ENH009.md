# Auditoria Mobile ENH-009
> Mockup: `docs/mockups/01-PokeWeather-mobile-9-pantallas.html`
> Rama: `feature/mobile-sprint-13`
> Actualizado: 2026-09-06

| # | Pantalla | Estado | Notas / US |
|---|----------|--------|------------|
| 1 | Inicio — sidebar oculto | **Completo** | BottomSheet colapsado (5vh) con handle. Mapa 100% altura. US-920 |
| 2 | Sidebar — climas y nidos | **Parcial** | BottomSheet al ~55vh con LocationFeed dentro. Tab separado Climas/Nidos NO implementado — es una sola lista mezclada. US-924 pendiente |
| 3 | Detalle ciudad / nido | **Completo** | LocationDetail anclada al bottom (85vh, border-radius 16px). US-920 |
| 4 | Mapa — navegando | **Completo** | Mapa full con MapPins. Pin cyan = Mi Zona (HomePin). US-913 |
| 5 | Botones del mapa | **Completo** | MapZoomControls existente sin cambios en mobile. US-920 confirmo sin regresion |
| 6 | Panel filtros | **Completo** | FilterPanelModal ya es BottomSheet. Boton con badge rojo. US-925 pendiente solo para ajuste de altura en mobile |
| 7 | Filtros activos visibles | **Parcial** | Badge rojo en boton existe. Strip de chips con X debajo del header NO implementado. US-925 |
| 8 | Mapa con Mi Zona activa | **Parcial** | Pin cyan + radio en mapa OK. Badge "Mi Zona activa" en sheet colapsado NO tiene glow/resaltado como mockup. US-926 |
| 9 | Sidebar — countdown + distancia | **Completo** | LocationCard muestra distancia (km) y cooldown cuando Mi Zona activa. US-921 badge conteo OK |

---

## Resumen

| Estado | Pantallas |
|--------|-----------|
| Completo | 1, 3, 4, 5, 9 |
| Parcial | 2, 7, 8 |
| No aplica | — |

## Gaps pendientes

| US | Gap |
|----|-----|
| US-924 | Pantalla 2: tabs separados Climas / Nidos en BottomSheet |
| US-925 | Pantalla 7: strip de chips filtros activos con X debajo del feed header |
| US-926 | Pantalla 8: badge "Mi Zona activa" con glow en sheet colapsado |
