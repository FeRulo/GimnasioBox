#!/bin/bash

echo "🏋️  GimnasioBox - Setup Script"
echo "================================"
echo ""

# Verificar si config.js existe
if [ ! -f "config.js" ]; then
    echo "📝 Creando config.js desde template..."
    cp config.js.example config.js
    echo "⚠️  IMPORTANTE: Edita config.js y agrega tu API_URL de Apps Script"
    echo ""
else
    echo "✅ config.js ya existe"
fi

# Verificar Python
if command -v python3 &> /dev/null; then
    echo "✅ Python3 instalado"
else
    echo "❌ Python3 no encontrado. Instala Python 3.x"
fi

# Verificar Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js instalado ($(node --version))"
else
    echo "⚠️  Node.js no encontrado (opcional, solo para clasp)"
fi

echo ""
echo "📚 Próximos pasos:"
echo "1. Edita config.js con tu URL de Apps Script"
echo "2. Ejecuta: python3 crear_excel.py (para crear la estructura Excel)"
echo "3. Copia el contenido de apps-script-backend.js a Apps Script"
echo "4. Deploy como Web App en Apps Script"
echo "5. Abre index.html en un servidor local"
echo ""
echo "Ver README.md para instrucciones completas"
