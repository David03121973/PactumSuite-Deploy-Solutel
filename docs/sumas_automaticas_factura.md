# Sumas Automáticas en Facturas

## Descripción

Se ha implementado un sistema que calcula automáticamente las sumas de servicios y productos en todos los endpoints que devuelven información de factura. Las sumas se calculan en tiempo real y se incluyen en la respuesta JSON.

## Cálculos Implementados

### Fórmulas de Cálculo

1. **Suma de Servicios**: `sum(servicio.importe * servicio.cantidad)`
2. **Suma de Productos**: `sum(producto.precio * factura_producto.cantidad)`
3. **Suma General**: `suma_servicios + suma_productos`

### Campos Agregados a la Respuesta

Todos los endpoints que devuelven facturas ahora incluyen estos campos adicionales:

- `suma_servicios`: Total calculado de todos los servicios
- `suma_productos`: Total calculado de todos los productos  
- `suma_general`: Suma total (servicios + productos)

## Endpoints Afectados

### 1. GET /Factura
**Descripción**: Obtener todas las facturas
**Cambio**: Cada factura en el array incluye las sumas calculadas

```json
[
  {
    "id_factura": 1,
    "num_consecutivo": 1001,
    "fecha": "2024-01-15T00:00:00.000Z",
    "estado": "Facturado",
    "suma_servicios": 300.50,
    "suma_productos": 150.75,
    "suma_general": 451.25,
    "servicio": [...],
    "productos": [...],
    "contrato": {...}
  }
]
```

### 2. GET /Factura/{id}
**Descripción**: Obtener una factura por ID
**Cambio**: La factura incluye las sumas calculadas

```json
{
  "id_factura": 1,
  "num_consecutivo": 1001,
  "fecha": "2024-01-15T00:00:00.000Z",
  "estado": "Facturado",
  "suma_servicios": 300.50,
  "suma_productos": 150.75,
  "suma_general": 451.25,
  "servicio": [...],
  "productos": [...],
  "contrato": {...}
}
```

### 3. POST /Factura/createFactura
**Descripción**: Crear una nueva factura
**Cambio**: La respuesta incluye la factura completa con sumas calculadas

```json
{
  "data": {
    "id_factura": 1,
    "num_consecutivo": 1001,
    "fecha": "2024-01-15T00:00:00.000Z",
    "estado": "No Facturado",
    "suma_servicios": 300.50,
    "suma_productos": 150.75,
    "suma_general": 451.25,
    "servicio": [...],
    "productos": [...],
    "contrato": {...},
    "trabajadorAutorizado": {...}
  }
}
```

### 4. PUT /Factura/updateFactura/{id}
**Descripción**: Actualizar una factura
**Cambio**: La respuesta incluye la factura actualizada con sumas calculadas

```json
{
  "id_factura": 1,
  "num_consecutivo": 1001,
  "fecha": "2024-01-15T00:00:00.000Z",
  "estado": "Facturado",
  "suma_servicios": 300.50,
  "suma_productos": 150.75,
  "suma_general": 451.25,
  "servicio": [...],
  "productos": [...],
  "contrato": {...}
}
```

### 5. POST /Factura/filterFacturas/{page}/{limit}
**Descripción**: Filtrar facturas con paginación
**Cambio**: Cada factura en el array filtrado incluye las sumas calculadas

```json
{
  "data": [
    {
      "id_factura": 1,
      "num_consecutivo": 1001,
      "fecha": "2024-01-15T00:00:00.000Z",
      "estado": "Facturado",
      "suma_servicios": 300.50,
      "suma_productos": 150.75,
      "suma_general": 451.25,
      "servicio": [...],
      "productos": [...],
      "contrato": {...}
    }
  ],
  "pagination": {
    "total": 1,
    "totalPages": 1,
    "currentPage": 1,
    "limit": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

## Implementación Técnica

### Función Helper

Se creó la función `calcularSumaGeneral()` en `services/facturaService.js`:

```javascript
const calcularSumaGeneral = (factura) => {
  let sumaServicios = 0;
  let sumaProductos = 0;

  // Calcular suma de servicios
  if (factura.servicio && Array.isArray(factura.servicio)) {
    sumaServicios = factura.servicio.reduce((total, servicio) => {
      const importe = parseFloat(servicio.importe) || 0;
      const cantidad = parseInt(servicio.cantidad) || 0;
      return total + (importe * cantidad);
    }, 0);
  }

  // Calcular suma de productos
  if (factura.productos && Array.isArray(factura.productos)) {
    sumaProductos = factura.productos.reduce((total, facturaProducto) => {
      const precio = parseFloat(facturaProducto.producto?.precio) || 0;
      const cantidad = parseFloat(facturaProducto.cantidad) || 0;
      return total + (precio * cantidad);
    }, 0);
  }

  const sumaGeneral = sumaServicios + sumaProductos;

  return {
    suma_servicios: Math.round(sumaServicios * 100) / 100,
    suma_productos: Math.round(sumaProductos * 100) / 100,
    suma_general: Math.round(sumaGeneral * 100) / 100
  };
};
```

### Características

- **Precisión**: Los valores se redondean a 2 decimales
- **Seguridad**: Manejo de valores nulos/undefined
- **Consistencia**: Los cálculos se realizan de la misma manera en todos los endpoints
- **Automatismo**: No requiere configuración adicional, funciona automáticamente

## Ventajas

1. **Información Completa**: Los clientes reciben las sumas sin necesidad de calcularlas
2. **Consistencia**: Los cálculos son uniformes en toda la API
3. **Precisión**: Manejo correcto de decimales y valores nulos
4. **Transparencia**: Los cálculos están documentados y son predecibles
5. **Rendimiento**: Los cálculos son eficientes y se realizan solo cuando es necesario

## Consideraciones

- Las sumas se calculan en tiempo de respuesta, no se almacenan en la base de datos
- Los cálculos requieren que las relaciones (servicios y productos) estén cargadas
- Para facturas con muchos items, el cálculo puede tener un pequeño impacto en el rendimiento
- Los valores se actualizan automáticamente cuando cambian los servicios o productos

## Ejemplo de Uso

```javascript
// Al llamar cualquier endpoint de factura, automáticamente recibes las sumas
const response = await fetch('/api/Factura/1');
const factura = await response.json();

console.log(`Suma de servicios: $${factura.suma_servicios}`);
console.log(`Suma de productos: $${factura.suma_productos}`);
console.log(`Suma general: $${factura.suma_general}`);
```
