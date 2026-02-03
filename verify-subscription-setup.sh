#!/bin/bash
# Script de verificación de instalación

echo "🔍 VERIFICANDO INSTALACIÓN DEL SISTEMA DE SUSCRIPCIÓN"
echo "======================================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_TOTAL=0

# Función para verificar archivo
check_file() {
  CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
  else
    echo -e "${RED}✗${NC} $1 (FALTA)"
  fi
}

# Función para verificar directorio
check_dir() {
  CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} $1/"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
  else
    echo -e "${RED}✗${NC} $1/ (FALTA)"
  fi
}

echo "📁 ARCHIVOS CREADOS:"
echo "---"
check_file "src/types/subscription.ts"
check_file "src/hooks/use-subscription.tsx"
check_file "src/lib/subscription-utils.ts"
check_file "src/lib/subscription-initialization.ts"
check_file "src/components/subscription/paywall.tsx"
check_file "src/app/api/mercadopago/create-preference.ts"
check_file "src/app/admin/subscription/page.tsx"
echo ""

echo "📚 DOCUMENTACIÓN:"
echo "---"
check_file "docs/SUBSCRIPTION_INDEX.md"
check_file "docs/SUBSCRIPTION_SETUP.md"
check_file "docs/SUBSCRIPTION_EXAMPLES.md"
check_file "docs/SUBSCRIPTION_IMPLEMENTATION.md"
check_file "docs/SUBSCRIPTION_INTEGRATION_GUIDE.md"
check_file "docs/SUBSCRIPTION_SUMMARY.md"
check_file "SUBSCRIPTION_README.md"
echo ""

echo "📦 CONFIGURACIÓN:"
echo "---"
check_file ".env.example"
check_file "package.json"
echo ""

echo "✏️ ARCHIVOS MODIFICADOS:"
echo "---"
echo -e "${YELLOW}!${NC} src/app/admin/layout.tsx (protección de suscripción agregada)"
echo -e "${YELLOW}!${NC} package.json (firebase-admin agregado)"
echo -e "${YELLOW}!${NC} .env.example (variables nuevas)"
echo ""

echo "======================================================"
echo "RESUMEN:"
echo "======================================================"
echo -e "Archivos verificados: ${GREEN}${CHECKS_PASSED}/${CHECKS_TOTAL}${NC}"
echo ""

if [ $CHECKS_PASSED -eq $CHECKS_TOTAL ]; then
  echo -e "${GREEN}✓ ¡TODA LA INSTALACIÓN ESTÁ COMPLETA!${NC}"
  echo ""
  echo "📝 PRÓXIMOS PASOS:"
  echo "  1. npm install firebase-admin"
  echo "  2. cp .env.example .env.local"
  echo "  3. Editar .env.local con tus credenciales"
  echo "  4. npm run dev"
  echo "  5. Ir a http://localhost:9002/admin/subscription"
  echo ""
  echo "📖 DOCUMENTACIÓN:"
  echo "  - Empezar: docs/SUBSCRIPTION_IMPLEMENTATION.md"
  echo "  - Todo: docs/SUBSCRIPTION_INDEX.md"
  echo "  - Ejemplos: docs/SUBSCRIPTION_EXAMPLES.md"
  exit 0
else
  echo -e "${RED}✗ Faltan archivos por crear${NC}"
  exit 1
fi
