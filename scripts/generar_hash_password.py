#!/usr/bin/env python3
"""
Script auxiliar para generar hashes de contraseña compatibles con Google Apps Script.
Usa SHA-256 con el mismo SALT que está configurado en config.private.gs
"""

import hashlib
import sys

# SALT debe coincidir con el de config.private.gs
SALT = "gimnasio_box_salt_2026_produccion_secret"

def generar_hash(password):
    """Genera hash SHA-256 de una contraseña + SALT"""
    data = password + SALT
    hash_obj = hashlib.sha256(data.encode('utf-8'))
    return hash_obj.hexdigest()

def main():
    print("=" * 60)
    print("GENERADOR DE HASHES DE CONTRASEÑA")
    print("Para administradores de Internacional Box")
    print("=" * 60)
    print()
    
    if len(sys.argv) > 1:
        # Password pasada como argumento
        password = sys.argv[1]
    else:
        # Pedir password interactivamente
        password = input("Ingresa la contraseña a hashear: ")
    
    if not password:
        print("❌ Error: La contraseña no puede estar vacía")
        sys.exit(1)
    
    hash_generado = generar_hash(password)
    
    print()
    print("✅ Hash generado exitosamente:")
    print()
    print(f"  Password: {password}")
    print(f"  Hash:     {hash_generado}")
    print()
    print("📋 Copia este hash y pégalo en la columna 'Password_Hash'")
    print("   de la hoja 'Administradores' en tu Google Sheets")
    print()
    print("⚠️  IMPORTANTE: Mantén este hash seguro y no lo compartas")
    print()

if __name__ == "__main__":
    main()
