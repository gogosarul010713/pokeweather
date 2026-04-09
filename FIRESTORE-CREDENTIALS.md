# 🔐 Cómo Obtener Credenciales de Firebase para Validación

**Para ejecutar `npm run validate:firebase`, necesitas el archivo serviceAccountKey.json**

---

## 📋 Pasos

### 1. Abre Firebase Console
```
https://console.firebase.google.com/
```
Selecciona el proyecto: **weather-app-prod-ef50d**

### 2. Vaya a Project Settings
```
Icono de ⚙️ (rueda) arriba a la izquierda → Project Settings
```

### 3. Pestaña "Service Accounts"
```
En la pestaña superior, selecciona "Service Accounts"
```

### 4. Generar Nueva Clave
```
Botón: "Generate New Private Key"
```

Esto descargará un archivo JSON similar a:
```json
{
  "type": "service_account",
  "project_id": "weather-app-prod-ef50d",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### 5. Guardar el Archivo
```bash
# Renombra el archivo a exactamente esto:
.env.serviceAccountKey.json

# Colócalo en la RAÍZ del proyecto pokeweather/
# NO en src/, NO en scripts/
```

### 6. Verificar .gitignore
```bash
# Abre .gitignore y verifica que contiene:
.env.serviceAccountKey.json
*.serviceAccountKey.json

# Si NO está, agrégalo
```

---

## ⚠️ SEGURIDAD CRÍTICA

**NUNCA commitees este archivo.**

- ❌ No lo subas a GitHub
- ❌ No lo pases por email
- ❌ No lo compartas públicamente
- ✅ La clave privada da acceso total a tu Firestore

Si accidentalmente lo commiteas:
1. Invalida la clave en Firebase Console
2. Genera una nueva
3. Agrega `.env.serviceAccountKey.json` a .gitignore
4. Ejecuta: `git rm --cached .env.serviceAccountKey.json`

---

## ✅ Verificar Instalación

```bash
# Instalar tsx (si no está)
npm install

# Verificar que el archivo existe
ls -la .env.serviceAccountKey.json
# Deberías ver: -rw-r--r-- (permisos correctos)

# Ejecutar validación
npm run validate:firebase
```

---

## 🚀 Ejecutar Validación

```bash
npm run validate:firebase
```

**Output esperado:**
```
🔥 Firebase Validation Script
================================================================================

✅ Firebase initialized
   📊 Validating US-801 (Pronósticos)...
   ✅ 5 cities found
   ✅ 60 total snapshots (avg 12 per city)
   ✅ 100% complete (12 snapshots)

   📊 Validating US-802 (Catálogo)...
   ✅ All 7 conditions present
   ✅ Type mapping for 7 conditions
   ✅ 7 unique Pokémon types
   ✅ Rules version: 1.0.0

================================================================================
📋 VALIDATION REPORT
================================================================================

Date: 2026-04-09
Passed: ✅ 2
Failed: ❌ 0
Warned: ⚠️  0

✅ [US-801] Found 5 cities with forecast data
   Details:
     cities: 5
     total_snapshots: 60
     avg_snapshots_per_city: 12.00
     complete_count: 5/5 (100%)

✅ [US-802] Catálogo estático validado
   Details:
     ...

================================================================================
✅ ALL VALIDATIONS PASSED
================================================================================

📄 Report saved to: firebase-validation-report.json
```

---

## 🔍 Si Hay Errores

### Error: ".env.serviceAccountKey.json not found"
**Solución:** Asegúrate de guardar el archivo en la raíz del proyecto

### Error: "Permission denied"
**Solución:** Verifica que la clave tiene permisos de lectura:
```bash
chmod 600 .env.serviceAccountKey.json
```

### Error: "Project ID mismatch"
**Solución:** Verifica que `VITE_FIREBASE_PROJECT_ID` en `.env.local` coincida con el archivo JSON:
```bash
# En .env.local:
VITE_FIREBASE_PROJECT_ID=weather-app-prod-ef50d

# En .env.serviceAccountKey.json:
"project_id": "weather-app-prod-ef50d"
```

---

## 📚 Referencias

- [Firebase Console](https://console.firebase.google.com/)
- [firebase-admin Documentation](https://firebase.google.com/docs/admin/setup)
- [Service Account Setup](https://firebase.google.com/docs/admin/start#set_as_a_service_account)

---

**Status:** Ready to validate  
**Last updated:** 2026-04-09
