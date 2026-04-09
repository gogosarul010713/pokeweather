# US-806 — TTL Automático para Documentos de Pronóstico

**Sprint:** 8 — Fase 2  
**Epic:** WDP (Weather Data Persistence)  
**Story Points:** 1 SP  
**Prioridad:** P2  
**Status:** ⏳ Pendiente  

---

## Historia de usuario

> Como sistema, quiero que los documentos de pronóstico se eliminen automáticamente después de 7 días para mantener el costo de Firestore bajo y la base de datos limpia.

---

## Criterios de aceptación

- [ ] Firestore TTL policy configurada en la colección `city_weather/{id}/forecasts`
- [ ] Campo `ttl` (Timestamp) presente en cada documento al crearlo (US-801 lo genera)
- [ ] Verificado en Firestore Console: TTL policy habilitada sobre el campo `ttl`
- [ ] Documentos de más de 7 días son eliminados automáticamente por Firestore (no hay código adicional)
- [ ] Documentado el proceso de configuración en esta US

> Esta US es **solo configuración en Firebase Console** — no requiere código en el frontend.

---

## Configuración paso a paso

### En Firebase Console

1. Ir a **Firestore Database** → **Indexes** → pestaña **TTL**
2. Click **"Add TTL Policy"**
3. Configurar:
   - **Collection group:** `forecasts`
   - **Timestamp field:** `ttl`
4. Click **"Create"**

> Firestore elimina documentos con `ttl <= now()` de forma eventual (puede tardar hasta 24h después de expirar).

### Verificación

```javascript
// En Firestore Console → Data, verificar que un doc de prueba tiene:
{
  ttl: Timestamp(2026-04-15T14:00:00Z),  // 7 días después de creación
  // ...otros campos
}
```

---

## Impacto en costo

| Escenario | Sin TTL (30 días) | Con TTL (7 días) |
|-----------|------------------|-----------------|
| Docs almacenados | ~2,820 | ~660 |
| Storage estimado | ~45 MB | ~10 MB |
| Costo en Spark (free) | $0 (< 1 GB) | $0 |

> Con el free tier de 1 GB, esta US es principalmente por higiene de datos, no por costo inmediato.

---

## Notas técnicas

- TTL es **eventual** en Firestore — no garantiza eliminación exacta a los 7 días, puede demorar hasta 24h extra
- Reads/writes de TTL no cuentan contra el free tier
- El campo `ttl` ya es generado por `firebaseWeatherService.ts` (US-801)
- Si se necesita historial más largo, cambiar el offset en `saveCityForecast()` de `7 días` a `N días`

---

## Dependencias

- US-801 (genera el campo `ttl` en cada documento)
- Firebase project creado (US-804)

## Bloqueante para

- Ninguna
