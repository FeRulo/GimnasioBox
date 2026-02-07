#!/usr/bin/env python3
"""
Script para crear el archivo Excel base del sistema de gestión del gimnasio.
Genera un archivo 'gimnasio_box.xlsx' con las pestañas, encabezados y datos de prueba.
"""

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from datetime import datetime, timedelta

def crear_excel_gimnasio():
    # Crear nuevo workbook
    wb = Workbook()
    
    # Eliminar la hoja por defecto
    wb.remove(wb.active)
    
    # Definir las hojas y sus encabezados
    hojas = {
        'Clientes': [
            'Documento', 'Nombre', 'Email', 'Plan_Semanal', 
            'Creditos_Usados', 'Membresia_Anual', 'Estado',
            'Fecha_Nacimiento', 'Edad', 'Contacto', 'EPS',
            'Acudiente', 'Contacto_Acudiente', 'Antecedentes', 'Objetivos'
        ],
        'Horarios': [
            'ID_Clase', 'Tipo', 'Coach', 'Fecha', 'Hora', 
            'Duracion', 'Cupos_Max', 'Cupos_Reservados'
        ],
        'Reservas': [
            'ID_Reserva', 'Documento', 'ID_Clase', 
            'Fecha_Registro', 'Estado'
        ],
        'Pagos': [
            'Fecha', 'Documento', 'Tipo_Pago', 
            'Link_Soporte', 'Estado'
        ]
    }
    
    # Estilo para los encabezados
    header_font = Font(bold=True, color="FFFFFF", size=11)
    header_fill = PatternFill(start_color="1A2A40", end_color="1A2A40", fill_type="solid")
    header_alignment = Alignment(horizontal="center", vertical="center")
    
    # Crear cada hoja con sus encabezados
    for nombre_hoja, encabezados in hojas.items():
        ws = wb.create_sheet(title=nombre_hoja)
        
        # Escribir encabezados
        for col_num, encabezado in enumerate(encabezados, start=1):
            cell = ws.cell(row=1, column=col_num)
            cell.value = encabezado
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = header_alignment
    
    # ========== POBLAR CON DATOS DUMMY ==========
    poblar_datos_dummy(wb)
    
    # Ajustar ancho de columnas para todas las hojas
    for sheet_name in hojas.keys():
        ws = wb[sheet_name]
        for col in ws.columns:
            max_length = 0
            column = col[0].column_letter
            for cell in col:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = max(max_length + 2, 15)
            ws.column_dimensions[column].width = adjusted_width
    
    # Guardar el archivo
    nombre_archivo = '../generated/gimnasio_box.xlsx'
    wb.save(nombre_archivo)
    print(f"✅ Archivo '{nombre_archivo}' creado exitosamente!")
    print(f"📋 Hojas creadas: {', '.join(hojas.keys())}")
    print(f"📊 Datos de prueba agregados exitosamente")
    
    return nombre_archivo

def poblar_datos_dummy(wb):
    """Poblar el workbook con datos de prueba"""
    
    # ========== CLIENTES ==========
    ws_clientes = wb['Clientes']
    clientes_dummy = [
        ['12345678', 'Juan Pérez', 'juan.perez@mail.com', 3, None, 'S', 'Activo', '1990-05-15', None, '3001234567', 'Salud Total', '', '', '', 'Funcional'],
        ['87654321', 'María López', 'maria.lopez@mail.com', 5, None, 'S', 'Activo', '1992-08-22', None, '3007654321', 'Compensar', '', '', '', 'Perder peso'],
        ['45678912', 'Carlos Rodríguez', 'carlos.r@mail.com', 3, None, 'S', 'Activo', '1988-03-10', None, '3009876543', 'Sura', '', '', '', 'Aprender boxeo'],
        ['78912345', 'Ana García', 'ana.garcia@mail.com', 4, None, 'N', 'Activo', '1995-11-30', None, '3002345678', 'Nueva EPS', '', '', '', 'Aumentar masa muscular'],
        ['11223344', 'Pedro Martínez', 'pedro.m@mail.com', 5, None, 'S', 'Activo', '1985-07-18', None, '3003456789', 'Sanitas', '', '', 'Hipertensión controlada', 'Funcional'],
        ['55667788', 'Laura Sánchez', 'laura.s@mail.com', 3, None, 'S', 'Activo', '1998-12-05', None, '3004567890', 'Famisanar', '', '', '', 'Perder peso'],
        ['99887766', 'Diego Torres', 'diego.t@mail.com', 4, None, 'S', 'Activo', '1993-04-25', None, '3005678901', 'Salud Total', '', '', '', 'Aprender boxeo'],
        ['22334455', 'Sofia Ramírez', 'sofia.r@mail.com', 5, None, 'S', 'Activo', '1991-09-14', None, '3006789012', 'Compensar', '', '', '', 'Funcional'],
    ]
    
    for fila, datos in enumerate(clientes_dummy, start=2):
        for col, valor in enumerate(datos, start=1):
            # Para la columna E (Creditos_Usados), insertar fórmula
            if col == 5:  # Columna E (Creditos_Usados)
                documento = datos[0]
                # Fórmula que cuenta reservas activas del documento
                formula = f'=COUNTIFS(Reservas!$B:$B,A{fila},Reservas!$E:$E,"Activa")'
                ws_clientes.cell(row=fila, column=col, value=formula)
            # Para la columna I (Edad), insertar fórmula que calcula años desde fecha de nacimiento
            elif col == 9:  # Columna I (Edad)
                # Fórmula DATEDIF para calcular edad en años
                formula = f'=DATEDIF(H{fila},TODAY(),"Y")'
                ws_clientes.cell(row=fila, column=col, value=formula)
            else:
                ws_clientes.cell(row=fila, column=col, value=valor)
    
    # ========== HORARIOS ==========
    ws_horarios = wb['Horarios']
    
    # Generar horarios para los próximos 7 días
    hoy = datetime.now()
    horarios_dummy = []
    
    for dia in range(7):
        fecha = (hoy + timedelta(days=dia)).strftime('%Y-%m-%d')
        
        # Horarios matutinos
        horarios_dummy.append([
            f'CLASE{len(horarios_dummy)+1:03d}', 
            'Boxeo', 
            'Hailer', 
            fecha, 
            '07:00 AM', 
            '90 min', 
            8, 
            0
        ])
        
        horarios_dummy.append([
            f'CLASE{len(horarios_dummy)+1:03d}', 
            'Fisio', 
            'Erika', 
            fecha, 
            '09:00 AM', 
            '60 min', 
            1, 
            0
        ])
        
        # Horarios vespertinos
        horarios_dummy.append([
            f'CLASE{len(horarios_dummy)+1:03d}', 
            'Boxeo', 
            'Hailer', 
            fecha, 
            '05:00 PM', 
            '90 min', 
            8, 
            0
        ])
        
        horarios_dummy.append([
            f'CLASE{len(horarios_dummy)+1:03d}', 
            'Boxeo', 
            'Hailer', 
            fecha, 
            '06:30 PM', 
            '90 min', 
            10, 
            0
        ])
    
    for fila, datos in enumerate(horarios_dummy, start=2):
        for col, valor in enumerate(datos, start=1):
            # Para la columna H (Cupos_Reservados), insertar fórmula
            if col == 8:  # Columna H (Cupos_Reservados)
                id_clase = datos[0]
                # Fórmula que cuenta reservas activas para este ID_Clase
                formula = f'=COUNTIFS(Reservas!$C:$C,A{fila},Reservas!$E:$E,"Activa")'
                ws_horarios.cell(row=fila, column=col, value=formula)
            else:
                ws_horarios.cell(row=fila, column=col, value=valor)
    
    # ========== RESERVAS ==========
    ws_reservas = wb['Reservas']
    reservas_dummy = [
        ['RES001', '12345678', 'CLASE001', datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'Activa'],
        ['RES002', '87654321', 'CLASE001', datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'Activa'],
        ['RES003', '45678912', 'CLASE003', datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'Activa'],
        ['RES004', '11223344', 'CLASE005', (datetime.now() - timedelta(hours=2)).strftime('%Y-%m-%d %H:%M:%S'), 'Cancelada'],
        ['RES005', '22334455', 'CLASE002', datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'Activa'],
        ['RES006', '55667788', 'CLASE004', datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'Activa'],
        ['RES007', '99887766', 'CLASE006', datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'Activa'],
    ]
    
    for fila, datos in enumerate(reservas_dummy, start=2):
        for col, valor in enumerate(datos, start=1):
            ws_reservas.cell(row=fila, column=col, value=valor)
    
    # ========== PAGOS ==========
    ws_pagos = wb['Pagos']
    pagos_dummy = [
        [datetime.now().strftime('%Y-%m-%d'), '12345678', 'Mensualidad', 'https://drive.google.com/file/ejemplo1', 'Aprobado'],
        [datetime.now().strftime('%Y-%m-%d'), '87654321', 'Inscripción Membresía', 'https://drive.google.com/file/ejemplo2', 'Aprobado'],
        [(datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d'), '45678912', 'Mensualidad', 'https://drive.google.com/file/ejemplo3', 'Pendiente'],
        [(datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d'), '78912345', 'Inscripción Membresía', 'https://drive.google.com/file/ejemplo4', 'Aprobado'],
        [datetime.now().strftime('%Y-%m-%d'), '11223344', 'Mensualidad', 'https://drive.google.com/file/ejemplo5', 'Pendiente'],
    ]
    
    for fila, datos in enumerate(pagos_dummy, start=2):
        for col, valor in enumerate(datos, start=1):
            ws_pagos.cell(row=fila, column=col, value=valor)

if __name__ == "__main__":
    crear_excel_gimnasio()
