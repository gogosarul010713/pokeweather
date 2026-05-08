# 🔦 Lighthouse Baseline Audit — US-903

**Fecha:** 2026-04-14  
**URL:** http://localhost:4174/  
**Dispositivo:** Desktop (Chrome Headless)

---

## 📊 Scores por Categoría

| Categoría | Score | Meta | Estado |
|-----------|-------|------|--------|
| **Performance** | **73** | ≥90 | ⚠️ ROJO |
| **Accessibility** | **100** | ≥95 | ✅ VERDE |
| **Best Practices** | **93** | ≥90 | ✅ VERDE |
| **SEO** | **83** | ≥100 | ⚠️ NARANJA |
| **OVERALL** | **87.25** | ≥85 | ✅ VERDE (borderline) |

---

## 🎯 Core Web Vitals

| Métrica | Valor | Meta | Estado |
|---------|-------|------|--------|
| **LCP** (Largest Contentful Paint) | **4.5s** | <2.5s | ❌ RED |
| **CLS** (Cumulative Layout Shift) | **0.0087** | <0.1 | ✅ GREEN |
| **INP** (Interaction to Next Paint) | N/A | <200ms | ⏳ N/A |

---

## 🔴 Problemas Críticos

### 1. LCP = 4.5s (TARGET: 2.5s, DELTA: -2.0s)
**Root Cause:** Leaflet CartoDB tile image loading

**LCP Element:**
```html
<img alt="" src="https://c.basemaps.cartocdn.com/light_all/2/1/1@2x.png" 
     class="leaflet-tile" style="width: 256px; height: 256px;...">
```

**Impact:** LCP is blocking ~1950ms of potential savings

**Why it's slow:**
1. Leaflet tiles load asynchronously after map initialization
2. CartoDB CDN has network latency
3. No preconnect or preload hints
4. No lazy load control (tiles are essential for initial render)

---

## 💡 Opportunities for Improvement

| Oportunidad | Ahorro Potencial | Dificultad | Orden |
|-------------|------------------|-----------|-------|
| **Preconnect Google Fonts** | LCP +300ms | Fácil | 1️⃣ |
| **Preconnect CartoDB CDN** | LCP +200ms | Fácil | 2️⃣ |
| **Preload LCP Image** | LCP +500ms | Medio | 3️⃣ |
| **Optimize Leaflet Init** | LCP +500ms | Difícil | 4️⃣ |
| **Code-split non-critical JS** | Performance | Difícil | 5️⃣ |

---

## 📋 Recomendaciones

### Quick Wins (15 min)

1. **Add preconnect to Google Fonts** in index.html:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   ```

2. **Add preconnect to CartoDB CDN** in index.html:
   ```html
   <link rel="preconnect" href="https://c.basemaps.cartocdn.com">
   ```

### Medium Effort (30 min)

3. **Image Optimization:** Verify all `/public/weather` and `/public/types` images have:
   - Lazy loading: `<img loading="lazy">`
   - Explicit dimensions: `width` and `height`
   - Potential WebP conversion (if large)

4. **Validate Code Splitting:** Ensure US-901 (Firebase lazy load) is active

### Higher Effort

5. **Investigate Leaflet init delay** → Could require architectural changes

---

## 📈 Next Steps

1. ✅ **Paso 2:** Implement quick wins (preconnect)
2. ✅ **Paso 3:** Validate Code Splitting from US-901
3. ✅ **Paso 4:** Optimize images in LocationCard, LocationDetail
4. 🔄 **Paso 5:** Re-run Lighthouse and compare

---

**Generado:** 2026-04-14 02:54:37 UTC  
**Lighthouse v12.8.2**
