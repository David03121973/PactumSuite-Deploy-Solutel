# Contratos con Información de Facturas

## Descripción

Se ha modificado el servicio de contratos para incluir automáticamente la lista de facturas asociadas a cada contrato, con sus datos básicos y el importe total calculado (suma de servicios y productos).

## Funcionalidad Implementada

### Información Agregada a Contratos

Cada contrato ahora incluye una propiedad `facturas` que contiene:

- **Datos básicos de cada factura**: ID, número consecutivo, fecha, estado, nota
- **Sumas calculadas automáticamente**:
  - `suma_servicios`: Total de servicios
  - `suma_productos`: Total de productos  
  - `suma_general`: Suma total (servicios + productos)

### Endpoints Afectados

Todos los endpoints que devuelven información de contratos ahora incluyen las facturas asociadas:

1. **`GET /Contrato`** - Lista todos los contratos con sus facturas
2. **`GET /Contrato/{id}`** - Obtiene un contrato específico con sus facturas
3. **`PUT /Contrato/updateContrato/{id}`** - Actualiza contrato y devuelve con facturas
4. **`POST /Contrato/filterContratos/{page}/{limit}`** - Filtra contratos con facturas
5. **`GET /Contrato/proximosAVencer`** - Contratos próximos a vencer con facturas

## Estructura de Respuesta

### Ejemplo de Contrato con Facturas

```json
{
  "id_contrato": 2080,
  "id_entidad": 549,
  "id_tipo_contrato": 8,
  "fecha_inicio": "2022-05-25T00:00:00.000Z",
  "fecha_fin": "2027-06-24T00:00:00.000Z",
  "num_consecutivo": 14,
  "clasificacion": "     ",
  "nota": "",
  "ClienteOProveedor": "Cliente",
  "createdAt": "2025-07-23T15:31:37.373Z",
  "updatedAt": "2025-07-23T15:31:37.373Z",
  "entidad": {
    "id_entidad": 549,
    "nombre": "ATI",
    "direccion": "Avenida de los Martires s/n, S.S",
    "telefono": "41328893",
    "email": null,
    "tipo_entidad": "Estatal"
  },
  "tipoContrato": {
    "id_tipo_contrato": 8,
    "nombre": "Prestación de Servicios"
  },
  "facturas": [
    {
      "id_factura": 4,
      "num_consecutivo": 1000,
      "fecha": "2025-09-10T00:00:00.000Z",
      "estado": "No Facturado",
      "nota": "",
      "created_at": "2025-09-10T21:03:15.889Z",
      "updated_at": "2025-09-10T21:04:47.748Z",
      "suma_servicios": 903,
      "suma_productos": 0,
      "suma_general": 903
    },
    {
      "id_factura": 7,
      "num_consecutivo": 1002,
      "fecha": "2025-09-10T00:00:00.000Z",
      "estado": "Facturado",
      "nota": null,
      "created_at": "2025-09-10T21:44:14.510Z",
      "updated_at": "2025-09-10T21:44:14.510Z",
      "suma_servicios": 0,
      "suma_productos": 3497.99,
      "suma_general": 3497.99
    }
  ]
}
```

## Implementación Técnica

### Funciones Helper Agregadas

1. **`calcularSumaGeneral(factura)`**: Calcula las sumas de servicios y productos
2. **`procesarFacturasConSumas(facturas)`**: Procesa el array de facturas agregando las sumas
3. **`getFacturasIncludes()`**: Define las relaciones necesarias para calcular sumas

### Cálculo de Sumas

Las sumas se calculan usando la misma lógica que en los endpoints de factura:

```javascript
// Suma de servicios
sumaServicios = facturas.servicio.reduce((total, servicio) => {
  return total + (parseFloat(servicio.importe) * parseInt(servicio.cantidad));
}, 0);

// Suma de productos  
sumaProductos = facturas.productos.reduce((total, producto) => {
  return total + (parseFloat(producto.precio) * parseFloat(producto.factura_producto.cantidad));
}, 0);

// Suma general
sumaGeneral = sumaServicios + sumaProductos;
```

### Relaciones Incluidas

Para calcular las sumas correctamente, se incluyen las siguientes relaciones:

- **Servicios**: `factura.servicio` con `importe` y `cantidad`
- **Productos**: `factura.productos` con `precio` y `factura_producto.cantidad`

## Ventajas

1. **Información Completa**: Los contratos incluyen toda la información financiera relacionada
2. **Consistencia**: Las sumas se calculan con la misma lógica que en los endpoints de factura
3. **Eficiencia**: Una sola consulta obtiene toda la información necesaria
4. **Transparencia**: Los cálculos están documentados y son predecibles
5. **Automatismo**: No requiere configuración adicional, funciona automáticamente

## Consideraciones de Rendimiento

### Optimizaciones Implementadas

- **Includes específicos**: Solo se incluyen las relaciones necesarias para calcular sumas
- **Procesamiento eficiente**: Las sumas se calculan en memoria después de obtener los datos
- **Redondeo**: Los valores se redondean a 2 decimales para mantener precisión

### Impacto en Consultas

- **Consultas más complejas**: Incluyen múltiples JOINs para obtener servicios y productos
- **Más datos transferidos**: Cada contrato incluye información de todas sus facturas
- **Procesamiento adicional**: Cálculo de sumas en memoria

### Recomendaciones

- **Índices**: Asegurar índices en `factura.id_contrato`, `servicio.id_factura`, `factura_producto.id_factura`
- **Paginación**: Usar paginación para contratos con muchas facturas
- **Caché**: Considerar caché para consultas frecuentes de contratos

## Casos de Uso

### 1. Dashboard de Contratos
```javascript
// Obtener todos los contratos con información financiera completa
const response = await fetch('/api/Contrato');
const contratos = await response.json();

// Calcular totales por contrato
contratos.forEach(contrato => {
  const totalFacturado = contrato.facturas
    .filter(f => f.estado === 'Facturado')
    .reduce((sum, f) => sum + f.suma_general, 0);
  
  console.log(`Contrato ${contrato.num_consecutivo}: $${totalFacturado}`);
});
```

### 2. Análisis Financiero
```javascript
// Analizar facturación por tipo de contrato
const response = await fetch('/api/Contrato');
const contratos = await response.json();

const analisis = contratos.reduce((acc, contrato) => {
  const tipo = contrato.tipoContrato.nombre;
  if (!acc[tipo]) acc[tipo] = { total: 0, facturas: 0 };
  
  contrato.facturas.forEach(factura => {
    acc[tipo].total += factura.suma_general;
    acc[tipo].facturas += 1;
  });
  
  return acc;
}, {});
```

### 3. Reportes de Vencimiento
```javascript
// Obtener contratos próximos a vencer con información financiera
const response = await fetch('/api/Contrato/proximosAVencer');
const contratos = await response.json();

contratos.forEach(contrato => {
  const totalPendiente = contrato.facturas
    .filter(f => f.estado === 'No Facturado')
    .reduce((sum, f) => sum + f.suma_general, 0);
  
  console.log(`Contrato ${contrato.num_consecutivo} vence en ${contrato.fecha_fin}: $${totalPendiente} pendiente`);
});
```

## Compatibilidad

- **Backward Compatible**: Los campos existentes se mantienen sin cambios
- **Nuevos Campos**: Se agregan los campos `facturas` y las sumas calculadas
- **API Estable**: No se modifican los endpoints existentes, solo se enriquece la respuesta

## Monitoreo

Para monitorear el rendimiento de las nuevas consultas:

1. **Tiempo de respuesta**: Medir el tiempo de las consultas con includes de facturas
2. **Uso de memoria**: Monitorear el uso de memoria al procesar múltiples contratos
3. **Consultas SQL**: Revisar las consultas generadas por Sequelize para optimización
