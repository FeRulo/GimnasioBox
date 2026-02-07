# Instrucciones para GitHub Copilot

## Restricciones de Documentación
- ❌ NO crear archivos de documentación `.md` sobre implementaciones realizadas
- ❌ NO crear resúmenes de cambios en archivos markdown (ej: IMPLEMENTACION.md, CAMBIOS.md, RESUMEN.md)
- ❌ NO crear documentación de features a menos que el usuario lo solicite explícitamente
- ✅ Solo responder con confirmación breve de cambios realizados

## Entorno Python
- ✅ SIEMPRE usar `source activate` antes de ejecutar comandos Python
- ✅ El entorno virtual está en `.venv/`
- ✅ Comando correcto: `source activate && python3 <archivo>`
- ❌ NO usar directamente `python3` sin activar el entorno

## Estructura del Proyecto
- `src/`: Código fuente JavaScript (frontend)
- `gas/`: Google Apps Script (backend)
- `scripts/`: Scripts de utilidades (Python, Bash)
- `images/`: Recursos gráficos
- `generated/`: Archivos generados (ignorados en Git)
- `docs/`: Documentación del proyecto (solo cuando es necesaria)
