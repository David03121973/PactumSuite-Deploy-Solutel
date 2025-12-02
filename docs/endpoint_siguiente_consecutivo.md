# Endpoint: Siguiente Número Consecutivo

## Descripción

Nuevo endpoint que devuelve el siguiente número consecutivo disponible para facturas de contratos tipo "Cliente" en un año específico. Este endpoint es útil para obtener automáticamente el próximo número consecutivo antes de crear una nueva factura.

## Endpoint

### GET /Factura/nextConsecutivo/{year}

**Descripción**: Obtiene el siguiente número consecutivo disponible para facturas de tipo "Cliente" en el año especificado.

**Autenticación**: Requerida (Bearer Token)

**Parámetros**:
- `year` (path, required): Año para el cual se desea obtener el siguiente número consecutivo
  - Tipo: integer
  - Rango: 1900 - 2100
  - Ejemplo: `2025`

## Lógica de Funcionamiento

### Algoritmo
1. **Validación del año**: Verifica que el año sea un número válido entre 1900 y 2100
2. **Búsqueda**: Busca la factura con el número consecutivo más alto para contratos tipo "Cliente" en el año especificado
3. **Cálculo**: Si existe una factura, devuelve `num_consecutivo + 1`. Si no existe ninguna, devuelve `1`

### Filtros Aplicados
- **Tipo de contrato**: Solo facturas de contratos con `ClienteOProveedor = 'Cliente'`
- **Año**: Solo facturas del año especificado en la URL
- **Ordenamiento**: Por `num_consecutivo` descendente para obtener el más alto

## Respuestas

### Respuesta Exitosa (200 OK)

```json
{
  "data": {
    "year": 2025,
    "nextConsecutivo": 13,
    "message": "El siguiente número consecutivo disponible para el año 2025 es 13."
  }
}
```

**Cuando no hay facturas existentes**:
```json
{
  "data": {
    "year": 2025,
    "nextConsecutivo": 1,
    "message": "No hay facturas de tipo Cliente en el año 2025. El siguiente número consecutivo es 1."
  }
}
```

### Respuesta de Error (400 Bad Request)

**Año inválido**:
```json
{
  "errors": ["El año debe ser un número válido entre 1900 y 2100"]
}
```

### Respuesta de Error (500 Internal Server Error)

```json
{
  "errors": ["Error al obtener siguiente número consecutivo"]
}
```

## Ejemplos de Uso

### Ejemplo 1: Año con facturas existentes

**Request**:
```
GET /api/Factura/nextConsecutivo/2025
Authorization: Bearer <token>
```

**Respuesta**:
```json
{
  "data": {
    "year": 2025,
    "nextConsecutivo": 13,
    "message": "El siguiente número consecutivo disponible para el año 2025 es 13."
  }
}
```

**Explicación**: Si en 2025 existen facturas con números consecutivos 1, 2, 5, 7, 8, 12, el siguiente disponible sería 13.

### Ejemplo 2: Año sin facturas existentes

**Request**:
```
GET /api/Factura/nextConsecutivo/2026
Authorization: Bearer <token>
```

**Respuesta**:
```json
{
  "data": {
    "year": 2026,
    "nextConsecutivo": 1,
    "message": "No hay facturas de tipo Cliente en el año 2026. El siguiente número consecutivo es 1."
  }
}
```

**Explicación**: Si no existen facturas de tipo "Cliente" en 2026, el primer número consecutivo disponible es 1.

### Ejemplo 3: Año inválido

**Request**:
```
GET /api/Factura/nextConsecutivo/abc
Authorization: Bearer <token>
```

**Respuesta**:
```json
{
  "errors": ["El año debe ser un número válido entre 1900 y 2100"]
}
```

## Casos de Uso

### 1. Formulario de Creación de Factura
```javascript
// Obtener el siguiente número consecutivo antes de mostrar el formulario
const response = await fetch('/api/Factura/nextConsecutivo/2025', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
const nextNumber = data.data.nextConsecutivo;

// Pre-llenar el campo num_consecutivo en el formulario
document.getElementById('num_consecutivo').value = nextNumber;
```

### 2. Validación en Tiempo Real
```javascript
// Verificar si un número consecutivo está disponible
const checkConsecutivo = async (year, number) => {
  const response = await fetch(`/api/Factura/nextConsecutivo/${year}`);
  const data = await response.json();
  const nextAvailable = data.data.nextConsecutivo;
  
  return number >= nextAvailable;
};
```

### 3. Generación Automática de Números
```javascript
// Sistema que genera automáticamente números consecutivos
const generateConsecutivo = async (year) => {
  const response = await fetch(`/api/Factura/nextConsecutivo/${year}`);
  const data = await response.json();
  return data.data.nextConsecutivo;
};
```

## Consideraciones Técnicas

### Rendimiento
- **Consulta optimizada**: Utiliza `ORDER BY num_consecutivo DESC LIMIT 1` para obtener eficientemente el número más alto
- **Índices**: Recomendado tener índices en `num_consecutivo` y `fecha` para mejor rendimiento
- **Caché**: Considerar implementar caché para consultas frecuentes del mismo año

### Concurrencia
- **Race Conditions**: Si múltiples usuarios consultan simultáneamente, podrían obtener el mismo número
- **Solución**: Implementar bloqueo o validación adicional al crear la factura

### Validación
- **Rango de años**: Limitado a 1900-2100 para evitar años inválidos
- **Solo Cliente**: Solo considera facturas de contratos tipo "Cliente"
- **Año específico**: Solo facturas del año exacto especificado

## Ventajas

1. **Automatización**: Evita errores manuales al asignar números consecutivos
2. **Eficiencia**: Reduce la necesidad de consultas adicionales para verificar disponibilidad
3. **Consistencia**: Garantiza la secuencia correcta de números consecutivos
4. **Flexibilidad**: Permite consultar cualquier año sin restricciones
5. **Claridad**: Proporciona mensajes descriptivos sobre el resultado

## Limitaciones

1. **Concurrencia**: No previene race conditions en entornos multi-usuario
2. **Solo Cliente**: No considera facturas de contratos tipo "Proveedor"
3. **Año específico**: No proporciona números consecutivos globales
4. **Sin reserva**: No reserva el número, solo lo sugiere

## Integración con Validación Existente

Este endpoint complementa la validación de unicidad implementada en `createFactura` y `updateFactura`:

1. **Consulta**: Usar este endpoint para obtener el siguiente número disponible
2. **Creación**: Usar el número obtenido al crear la factura
3. **Validación**: La validación existente verificará que el número sea único
4. **Confirmación**: Si hay conflicto, la validación lo detectará y reportará error
