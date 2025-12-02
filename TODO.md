# TODO: Incluir importe total de factura en filterEntradas

## Steps to Complete

- [ ] Import facturaService in services/entradaService.js to access calcularSumaGeneral
- [ ] Enhance the include for 'factura' in filterEntradas with nested includes for 'servicio' and 'productos' (with through attributes)
- [ ] After fetching entradas, map over them to compute suma_general (using calcularSumaGeneral + cargoAdicional) and attach to each factura
- [ ] Ensure the enhanced entradas are returned in the response
- [ ] Test the changes to verify totals are correctly attached
