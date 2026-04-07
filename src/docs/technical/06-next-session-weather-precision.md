# 🎯 Sprint 7 — Weather Precision Improvement

**Status**: ⏳ PENDIENTE PARA PRÓXIMA SESIÓN

## Problema

La precisión de la replicación del clima actual no es 100% exacta con Pokémon GO:
- AccuWeather devuelve `weatherIcon` numéricos
- Mapeamos a 7 condiciones base: sunny, partly, cloudy, fog, rain, snow, windy
- Pokémon GO usa un sistema propietario más granular

**Impacto**:
- Los tipos potenciados pueden no coincidir exactamente con Pokémon GO
- Usuario ve clima diferente en PWE vs app oficial

## Objetivos Sprint 7

- [ ] Investigar API de Pokémon GO Weather (si está públicamente disponible)
- [ ] Validar accuracy actual: comparar con datos reales de PGO
- [ ] Mejorar mapeo AccuWeather → PGO conditions
- [ ] Target: 95%+ accuracy vs Pokémon GO oficial
- [ ] Documentar mapping final en `src/services/weather/weather-mapping.md`

## Archivos Relacionados

- `src/services/weather/weatherService.ts` - Mapeo condiciones (línea 9-16)
- `src/tests/test-batch-accuracy.ts` - Tests de precisión
- `src/docs/03-weather-logic.md` - Lógica actual

## Referencias

- Pokémon GO Weather System: https://pokemongo.fandom.com/wiki/Weather
- AccuWeather Icons: https://developer.accuweather.com/weather-icons

---

**Última actualización**: 2026-03-25
**Creado por**: Sprint 6 (After mock removal)
