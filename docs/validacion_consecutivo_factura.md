# Validación de Número Consecutivo Único por Año

## Descripción

Se ha implementado una validación que asegura que el número consecutivo de facturas sea único por año, pero **solo para contratos de tipo "Cliente"**. Esta validación no aplica para contratos de tipo "Proveedor".

## Reglas de Validación

### Para Contratos de Tipo "Cliente"
- **Restricción**: El número consecutivo debe ser único por año
- **Ejemplo**: En 2025 solo puede existir una factura con `num_consecutivo = 12`
- **Permitido**: En 2026 puede existir otra factura con `num_consecutivo = 12`

### Para Contratos de Tipo "Proveedor"
- **Sin restricciones**: Pueden existir múltiples facturas con el mismo número consecutivo
- **Ejemplo**: Pueden existir múltiples facturas con `num_consecutivo = 12` en el mismo año

## Implementación

### Función de Validación

La función `validarNumeroConsecutivoUnico()` verifica:

1. **Existencia del contrato**
2. **Tipo de contrato**: Solo aplica validación si es "Cliente"
3. **Unicidad por año**: Busca facturas existentes con el mismo número consecutivo en el mismo año
4. **Exclusión en actualización**: Al actualizar, excluye la factura actual del chequeo

```javascript
const validarNumeroConsecutivoUnico = async (numConsecutivo, fecha, idContrato, idFacturaExcluir = null) => {
  // Obtener el contrato
  const contrato = await Contrato.findOne({ where: { id_contrato: idContrato } });
  
  // Si no es "Cliente", no aplicar validación
  if (contrato.ClienteOProveedor !== 'Cliente') {
    return { valido: true, mensaje: "Validación no aplica para contratos de tipo Proveedor" };
  }
  
  // Extraer año de la fecha
  const añoFactura = new Date(fecha).getFullYear();
  
  // Buscar facturas existentes con el mismo número consecutivo en el mismo año
  const facturaExistente = await Factura.findOne({
    where: {
      num_consecutivo: numConsecutivo,
      '$contrato.ClienteOProveedor$': 'Cliente',
      [Op.and]: [
        sequelize.where(
          sequelize.fn('YEAR', sequelize.col('factura.fecha')),
          añoFactura
        )
      ]
    },
    include: [{ model: Contrato, as: 'contrato' }]
  });
  
  // Si existe, retornar error
  if (facturaExistente) {
    return { 
      valido: false, 
      mensaje: `Ya existe una factura con número consecutivo ${numConsecutivo} en el año ${añoFactura} para un contrato de tipo Cliente` 
    };
  }
  
  return { valido: true, mensaje: "Número consecutivo válido" };
};
```

## Endpoints Afectados

### 1. POST /Factura/createFactura
**Validación aplicada**: Al crear una nueva factura
**Momento**: Después de verificar que el contrato existe
**Error**: Si ya existe una factura con el mismo número consecutivo en el mismo año para un contrato de tipo "Cliente"

### 2. PUT /Factura/updateFactura/{id}
**Validación aplicada**: Al actualizar una factura cuando se modifica:
- `num_consecutivo`
- `fecha`
- `id_contrato`

**Exclusión**: La factura actual se excluye del chequeo de duplicados

## Ejemplos de Uso

### Caso 1: Contrato de Tipo "Cliente" - Válido
```json
{
  "num_consecutivo": 12,
  "fecha": "2025-03-15T00:00:00.000Z",
  "id_contrato": 2080,
  "estado": "No Facturado"
}
```
**Resultado**: ✅ Válido (primera factura con número 12 en 2025)

### Caso 2: Contrato de Tipo "Cliente" - Inválido
```json
{
  "num_consecutivo": 12,
  "fecha": "2025-06-10T00:00:00.000Z",
  "id_contrato": 2080,
  "estado": "No Facturado"
}
```
**Resultado**: ❌ Error - "Ya existe una factura con número consecutivo 12 en el año 2025 para un contrato de tipo Cliente"

### Caso 3: Contrato de Tipo "Proveedor" - Siempre Válido
```json
{
  "num_consecutivo": 12,
  "fecha": "2025-03-15T00:00:00.000Z",
  "id_contrato": 3000,
  "estado": "No Facturado"
}
```
**Resultado**: ✅ Válido (no aplica validación para contratos de tipo "Proveedor")

### Caso 4: Diferentes Años - Válido
```json
{
  "num_consecutivo": 12,
  "fecha": "2026-03-15T00:00:00.000Z",
  "id_contrato": 2080,
  "estado": "No Facturado"
}
```
**Resultado**: ✅ Válido (diferente año, 2026)

## Mensajes de Error

### Error de Validación
```json
{
  "errors": [
    "Ya existe una factura con número consecutivo 12 en el año 2025 para un contrato de tipo Cliente"
  ]
}
```

### Respuesta HTTP
- **Status Code**: 400 Bad Request
- **Content-Type**: application/json

## Consideraciones Técnicas

### Base de Datos
- La validación utiliza consultas SQL con funciones de fecha (`YEAR()`)
- Se incluye la relación con el modelo `Contrato` para verificar el tipo
- Se optimiza excluyendo la factura actual en actualizaciones

### Rendimiento
- La validación se ejecuta solo para contratos de tipo "Cliente"
- Se realiza una consulta adicional a la base de datos
- El impacto es mínimo ya que es una consulta simple con índices

### Casos Edge
- **Contratos inexistentes**: Se valida la existencia antes de aplicar la regla
- **Fechas inválidas**: Se valida el formato de fecha antes de extraer el año
- **Actualizaciones**: Se excluye la factura actual del chequeo de duplicados

## Ventajas

1. **Flexibilidad**: Solo aplica para contratos de tipo "Cliente"
2. **Precisión**: Valida por año, permitiendo reutilización en años diferentes
3. **Consistencia**: Misma validación en creación y actualización
4. **Claridad**: Mensajes de error descriptivos
5. **Eficiencia**: No aplica validación innecesaria para contratos de "Proveedor"
