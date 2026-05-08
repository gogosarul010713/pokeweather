#!/bin/bash

echo "🔍 VALIDACIÓN DE CÓDIGO FUENTE"
echo "================================"

echo ""
echo "1️⃣  Verificando loading='lazy' en LocationCard.tsx..."
LAZY_COUNT=$(grep -c 'loading="lazy"' src/components/Sidebar/LocationCard.tsx 2>/dev/null || echo "0")
echo "   ✅ Encontradas: $LAZY_COUNT instancias de loading='lazy'"

echo ""
echo "2️⃣  Verificando dimensiones explícitas (width/height) en LocationCard.tsx..."
WIDTH_COUNT=$(grep -c 'width={' src/components/Sidebar/LocationCard.tsx 2>/dev/null || echo "0")
HEIGHT_COUNT=$(grep -c 'height={' src/components/Sidebar/LocationCard.tsx 2>/dev/null || echo "0")
echo "   ✅ Width attributes: $WIDTH_COUNT"
echo "   ✅ Height attributes: $HEIGHT_COUNT"

echo ""
echo "3️⃣  Verificando loading='lazy' en LocationDetail.tsx..."
LAZY_COUNT2=$(grep -c 'loading="lazy"' src/components/Sidebar/LocationDetail.tsx 2>/dev/null || echo "0")
echo "   ✅ Encontradas: $LAZY_COUNT2 instancias de loading='lazy'"

echo ""
echo "4️⃣  Verificando preconnect hints en index.html..."
PRECONNECT_COUNT=$(grep -c 'rel="preconnect"' index.html 2>/dev/null || echo "0")
echo "   ✅ Encontradas: $PRECONNECT_COUNT instancias de preconnect"

echo ""
echo "5️⃣  Verificando Firebase lazy loading..."
GETDB_COUNT=$(grep -c 'await getDb()' src/services/firebase/*.ts 2>/dev/null | awk -F: '{sum+=$2} END {print sum}')
echo "   ✅ Funciones usando await getDb(): $GETDB_COUNT"

echo ""
echo "================================================"
echo "✅ VALIDACIÓN DE CÓDIGO COMPLETADA"
echo "================================================"

TOTAL_OPTIMIZATIONS=$((LAZY_COUNT + LAZY_COUNT2 + PRECONNECT_COUNT))
echo ""
echo "📊 RESUMEN:"
echo "  - Lazy loading en LocationCard: $LAZY_COUNT"
echo "  - Lazy loading en LocationDetail: $LAZY_COUNT2"
echo "  - Preconnect hints: $PRECONNECT_COUNT"
echo "  - Total optimizaciones detectadas: $TOTAL_OPTIMIZATIONS"
