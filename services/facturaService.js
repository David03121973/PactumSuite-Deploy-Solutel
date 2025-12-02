// services/facturaService.js

const { Op } = require('sequelize');
const Factura = require('../models/factura');
const Servicio = require('../models/servicio');
const Producto = require('../models/producto');
const FacturaProducto = require('../models/factura_producto');
const Contrato = require('../models/contrato');
const Entidad = require('../models/entidad');
const TipoContrato = require('../models/tipo_contrato');
const TrabajadorAutorizado = require('../models/trabajador_autorizado');
const Usuario = require('../models/usuario');
const Entrada = require('../models/entrada');

const baseIncludes = () => ([
  { model: Servicio, as: 'servicio' },
  { model: Producto, as: 'productos', through: { attributes: ['cantidad', 'precioVenta', 'costoVenta'] } },
  { model: TrabajadorAutorizado, as: 'trabajadorAutorizado' },
  { model: Usuario, as: 'usuario' },
  { model: Contrato, as: 'contrato', include: [
      { model: Entidad, as: 'entidad' },
      { model: TipoContrato, as: 'tipoContrato' },
    ]
  },
]);

const getAllFacturas = async () => {
  try {
    return await Factura.findAll({
      include: baseIncludes(),
      order: [["fecha", "DESC"], ["id_factura", "DESC"]],
    });
  } catch (error) {
    console.error('Error en getAllFacturas:', error);
    throw error;
  }
};

const getFacturaById = async (id) => {
  try {
    return await Factura.findOne({
      where: { id_factura: id },
      include: baseIncludes(),
    });
  } catch (error) {
    console.error('Error en getFacturaById:', error);
    throw error;
  }
};

const sequelize = require('../helpers/database');

const createFactura = async (data) => {
  try {
    const errors = [];
  const { num_consecutivo, fecha, estado, id_contrato, id_trabajador_autorizado, nota, services, products, cargoAdicional } = data || {};
  
    // soporte para id_usuario en create
    const idUsuarioRaw = data.id_usuario !== undefined ? data.id_usuario : undefined;
    const idUsuarioNum = idUsuarioRaw !== undefined && idUsuarioRaw !== null && idUsuarioRaw !== '' ? parseInt(idUsuarioRaw, 10) : null;
    if (idUsuarioRaw !== undefined) {
      if (Number.isNaN(idUsuarioNum) || idUsuarioNum <= 0) {
        errors.push('id_usuario debe ser un entero positivo');
      }
    }

    if (num_consecutivo === undefined || fecha === undefined || id_contrato === undefined) {
      errors.push("Campos obligatorios: num_consecutivo, fecha, id_contrato");
    }

    const numConsecutivoNum = parseInt(num_consecutivo, 10);
    if (Number.isNaN(numConsecutivoNum) || numConsecutivoNum <= 0) {
      errors.push("num_consecutivo debe ser un entero positivo");
    }

    if (!fecha || isNaN(Date.parse(fecha))) {
      errors.push("fecha debe ser una fecha válida");
    }

    const idContratoNum = parseInt(id_contrato, 10);
    if (Number.isNaN(idContratoNum) || idContratoNum <= 0) {
      errors.push("id_contrato debe ser un entero positivo");
    }

    const idTANum = id_trabajador_autorizado !== undefined && id_trabajador_autorizado !== null && id_trabajador_autorizado !== '' ? parseInt(id_trabajador_autorizado, 10) : null;
    if (id_trabajador_autorizado !== undefined && id_trabajador_autorizado !== null && id_trabajador_autorizado !== '') {
      if (Number.isNaN(idTANum) || idTANum <= 0) {
        errors.push("id_trabajador_autorizado debe ser un entero positivo");
      }
    }

    if (estado && !['Facturado', 'No Facturado', 'Cancelado'].includes(estado)) {
      errors.push('estado debe ser "Facturado", "No Facturado" o "Cancelado"');
    }

    // Validar cargoAdicional si viene
    if (cargoAdicional !== undefined && cargoAdicional !== null && cargoAdicional !== '') {
      const ca = parseFloat(cargoAdicional);
      if (Number.isNaN(ca) || ca < 0) {
        errors.push('cargoAdicional debe ser un número mayor o igual a 0');
      }
    }

    // FK existence
    if (!Number.isNaN(idContratoNum) && idContratoNum > 0) {
      const contratoOk = await contratoExists(idContratoNum);
      if (!contratoOk) errors.push("El contrato especificado no existe");
      
      // Validar número consecutivo único por año para contratos de tipo "Cliente"
      if (contratoOk) {
        const validacionConsecutivo = await validarNumeroConsecutivoUnico(numConsecutivoNum, fecha, idContratoNum);
        if (!validacionConsecutivo.valido) {
          errors.push(validacionConsecutivo.mensaje);
        }
        // Validar que la fecha de la nueva factura sea posterior a la factura anterior (consecutivo - 1) en el mismo año para contratos Cliente
        const validacionOrdenFecha = await validarOrdenConsecutivoFecha(numConsecutivoNum, fecha, idContratoNum);
        if (!validacionOrdenFecha.valido) {
          errors.push(validacionOrdenFecha.mensaje);
        }
      }
    }
    if (idTANum !== null && !Number.isNaN(idTANum) && idTANum > 0) {
      const taOk = await trabajadorAutorizadoExists(idTANum);
      if (!taOk) errors.push("El trabajador autorizado especificado no existe");
    }

    // Validar usuario existe
    if (idUsuarioRaw !== undefined && idUsuarioNum !== null && !Number.isNaN(idUsuarioNum) && idUsuarioNum > 0) {
      const usuarioOk = await usuarioExists(idUsuarioNum);
      if (!usuarioOk) errors.push('El usuario especificado no existe');
    }

    // Validar que no se envíen tanto services como products al mismo tiempo
    if (services !== undefined && products !== undefined) {
      errors.push('No se puede enviar tanto services como products al mismo tiempo. Use solo uno de los dos.');
    }

    // Validar services si viene
    if (services !== undefined) {
      if (!Array.isArray(services)) {
        errors.push('services debe ser un arreglo');
      } else {
        const invalid = services.some((s) => !s || s.descripcion === undefined || s.importe === undefined || s.cantidad === undefined || s.unidadMedida === undefined);
        if (invalid) {
          errors.push('Al menos un servicio no tiene la estructura correcta (debe incluir descripcion, importe, cantidad y unidadMedida)');
        }
      }
    }

    // Validar products si viene
    if (products !== undefined) {
      if (!Array.isArray(products)) {
        errors.push('products debe ser un arreglo');
      } else {
        const invalid = products.some((p) => !p || p.id_producto === undefined || p.cantidad === undefined);
        if (invalid) {
          errors.push('Al menos un producto no tiene la estructura correcta (debe incluir id_producto y cantidad)');
        } else {
          // Obtener el contrato para validaciones
          const contrato = await Contrato.findOne({ where: { id_contrato: idContratoNum } });

          // Validar que todos los productos existan y tengan cantidad válida
          for (const product of products) {
            const idProductoNum = parseInt(product.id_producto, 10);
            if (Number.isNaN(idProductoNum) || idProductoNum <= 0) {
              errors.push(`ID de producto inválido: ${product.id_producto}`);
            } else {
              const productoOk = await productoExists(idProductoNum);
              if (!productoOk) {
                errors.push(`El producto con ID ${idProductoNum} no existe`);
              }
            }

            const cantidadNum = parseFloat(product.cantidad);
            if (Number.isNaN(cantidadNum) || cantidadNum < 0) {
              errors.push(`Cantidad inválida para producto ${product.id_producto}: ${product.cantidad} (debe ser un número decimal mayor o igual a 0)`);
            }

            // Validar precio y costo si se proporcionan y el contrato es Proveedor
            if (contrato && contrato.ClienteOProveedor === 'Proveedor') {
              if (product.precio !== undefined) {
                const precioNum = parseFloat(product.precio);
                if (Number.isNaN(precioNum) || precioNum < 0) {
                  errors.push(`Precio inválido para producto ${product.id_producto}: debe ser un número >= 0`);
                }
              }
              if (product.costo !== undefined) {
                const costoNum = parseFloat(product.costo);
                if (Number.isNaN(costoNum) || costoNum < 0) {
                  errors.push(`Costo inválido para producto ${product.id_producto}: debe ser un número >= 0`);
                }
              }
            }
          }

          // Validar que todos los productos tengan suficiente stock disponible (solo para contratos de tipo "Cliente")
          if (errors.length === 0 && contrato && contrato.ClienteOProveedor === 'Cliente') {
            for (const product of products) {
              const idProductoNum = parseInt(product.id_producto, 10);
              const producto = await Producto.findOne({ where: { id_producto: idProductoNum } });
              const cantidadNum = parseFloat(product.cantidad);

              if (producto && producto.cantidadExistencia < cantidadNum) {
                errors.push(`La cantidad en existencia del producto ${producto.nombre} es insuficiente: ${producto.cantidadExistencia}`);
              }
            }
          }
        }
      }
    }

    if (errors.length > 0) {
      return { errors };
    }

    // Transacción: crear factura, servicios y productos
    const result = await sequelize.transaction(async (t) => {
      const nueva = await Factura.create({
        num_consecutivo: numConsecutivoNum,
        fecha: new Date(fecha),
        estado: estado || 'No Facturado',
        id_contrato: idContratoNum,
        id_trabajador_autorizado: idTANum,
        id_usuario: idUsuarioNum,
        nota: nota || null,
        cargoAdicional: cargoAdicional !== undefined ? (cargoAdicional === '' ? null : parseFloat(cargoAdicional)) : null,
      }, { transaction: t });

      if (Array.isArray(services) && services.length > 0) {
        const serviciosData = services.map((s) => ({
          descripcion: s.descripcion,
          cantidad: parseInt(s.cantidad, 10),
          importe: parseFloat(s.importe),
          unidadMedida: s.unidadMedida,
          id_factura: nueva.id_factura,
        }));
        await Servicio.bulkCreate(serviciosData, { transaction: t });
      }

      if (Array.isArray(products) && products.length > 0) {
        // Obtener el contrato para determinar precios y actualizar inventario
        const contrato = await Contrato.findOne({ where: { id_contrato: idContratoNum } });
        // Obtener productos con sus datos para precioVenta y costoVenta
        const productosConDatos = await Promise.all(products.map(async (p) => {
          const producto = await Producto.findOne({ where: { id_producto: parseInt(p.id_producto, 10) } });
          return {
            id_factura: nueva.id_factura,
            id_producto: parseInt(p.id_producto, 10),
            cantidad: parseFloat(p.cantidad),
            precioVenta: (contrato && contrato.ClienteOProveedor === 'Proveedor' && p.precio !== undefined) ? parseFloat(p.precio) : producto.precio,
            costoVenta: (contrato && contrato.ClienteOProveedor === 'Proveedor' && p.costo !== undefined) ? parseFloat(p.costo) : producto.costo,
          };
        }));

        await FacturaProducto.bulkCreate(productosConDatos, { transaction: t });

        // Actualizar inventario de productos basado en el tipo de contrato
        for (const p of products) {
          const idProducto = parseInt(p.id_producto, 10);
          const cantidad = parseFloat(p.cantidad);

          if (contrato && contrato.ClienteOProveedor === 'Cliente') {
            // Para contratos de Cliente: decrementar inventario
            await Producto.decrement('cantidadExistencia', {
              by: cantidad,
              where: { id_producto: idProducto },
              transaction: t
            });
          } else if (contrato && contrato.ClienteOProveedor === 'Proveedor') {
            // Para contratos de Proveedor: incrementar inventario
            await Producto.increment('cantidadExistencia', {
              by: cantidad,
              where: { id_producto: idProducto },
              transaction: t
            });
          }
        }

        // Crear entradas si el contrato es Proveedor
        if (contrato && contrato.ClienteOProveedor === 'Proveedor') {
          const entradasData = products.map(p => {
            const productoData = productosConDatos.find(pd => pd.id_producto === parseInt(p.id_producto, 10));
            return {
              id_factura: nueva.id_factura,
              id_contrato: idContratoNum,
              id_producto: parseInt(p.id_producto, 10),
              cantidadEntrada: parseFloat(p.cantidad),
              costo: p.costo !== undefined ? parseFloat(p.costo) : productoData.costoVenta,
              fecha: new Date(),
              nota: '',
            };
          });
          await Entrada.bulkCreate(entradasData, { transaction: t });
        }
      }

      return nueva;
    });

    return { data: result };
  } catch (error) {
    console.error('Error en createFactura:', error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al crear factura');
      err.errors = [error.message || 'Error interno al crear factura'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

const updateFactura = async (id, data) => {
  try {
    const factura = await Factura.findOne({ where: { id_factura: id } });
    if (!factura) return { errors: ["Factura no encontrada"] };

    const errors = [];
  const { num_consecutivo, fecha, estado, id_contrato, id_trabajador_autorizado, nota, products, cargoAdicional } = data || {};

    const updateData = {};
    if (num_consecutivo !== undefined) {
      const n = parseInt(num_consecutivo, 10);
      if (Number.isNaN(n) || n <= 0) errors.push("num_consecutivo debe ser un entero positivo");
      else updateData.num_consecutivo = n;
    }
    if (fecha !== undefined) {
      if (isNaN(Date.parse(fecha))) errors.push("fecha debe ser una fecha válida");
      else updateData.fecha = new Date(fecha);
    }
    
    // Validar número consecutivo único por año cuando se actualiza num_consecutivo o fecha
    if ((num_consecutivo !== undefined || fecha !== undefined) && id_contrato === undefined) {
      const numConsecutivoActual = num_consecutivo !== undefined ? parseInt(num_consecutivo, 10) : factura.num_consecutivo;
      const fechaActual = fecha !== undefined ? new Date(fecha) : factura.fecha;

      if (!Number.isNaN(numConsecutivoActual) && fechaActual) {
        const validacionConsecutivo = await validarNumeroConsecutivoUnico(numConsecutivoActual, fechaActual, factura.id_contrato, id);
        if (!validacionConsecutivo.valido) {
          errors.push(validacionConsecutivo.mensaje);
        }
      }
    }
    if (estado !== undefined) {
      if (!['Facturado', 'No Facturado', 'Cancelado'].includes(estado)) errors.push('estado debe ser "Facturado", "No Facturado" o "Cancelado"');
      else updateData.estado = estado;
    }
    if (id_contrato !== undefined) {
      const n = parseInt(id_contrato, 10);
      if (Number.isNaN(n) || n <= 0) errors.push("id_contrato debe ser un entero positivo");
      else {
        const ok = await contratoExists(n);
        if (!ok) errors.push("El contrato especificado no existe");
        else {
          updateData.id_contrato = n;
          
          // Validar número consecutivo único por año para contratos de tipo "Cliente"
          const numConsecutivoActual = num_consecutivo !== undefined ? parseInt(num_consecutivo, 10) : factura.num_consecutivo;
          const fechaActual = fecha !== undefined ? new Date(fecha) : factura.fecha;
          
          if (!Number.isNaN(numConsecutivoActual) && fechaActual) {
            const validacionConsecutivo = await validarNumeroConsecutivoUnico(numConsecutivoActual, fechaActual, n, id);
            if (!validacionConsecutivo.valido) {
              errors.push(validacionConsecutivo.mensaje);
            }
          }
        }
      }
    }
    if (id_trabajador_autorizado !== undefined) {
      if (id_trabajador_autorizado === null || id_trabajador_autorizado === '') {
        updateData.id_trabajador_autorizado = null;
      } else {
        const n = parseInt(id_trabajador_autorizado, 10);
        if (Number.isNaN(n) || n <= 0) errors.push("id_trabajador_autorizado debe ser un entero positivo");
        else {
          const ok = await trabajadorAutorizadoExists(n);
          if (!ok) errors.push("El trabajador autorizado especificado no existe");
          else updateData.id_trabajador_autorizado = n;
        }
      }
    }
      // Validar id_usuario en update
      if (data.id_usuario !== undefined) {
        if (data.id_usuario === null || data.id_usuario === '') {
          updateData.id_usuario = null;
        } else {
          const nu = parseInt(data.id_usuario, 10);
          if (Number.isNaN(nu) || nu <= 0) errors.push('id_usuario debe ser un entero positivo');
          else {
            const ok = await usuarioExists(nu);
            if (!ok) errors.push('El usuario especificado no existe');
            else updateData.id_usuario = nu;
          }
        }
      }
    if (nota !== undefined) updateData.nota = nota;
    if (cargoAdicional !== undefined) {
      if (cargoAdicional === null || cargoAdicional === '') updateData.cargoAdicional = null;
      else {
        const ca = parseFloat(cargoAdicional);
        if (Number.isNaN(ca) || ca < 0) errors.push('cargoAdicional debe ser un número mayor o igual a 0');
        else updateData.cargoAdicional = ca;
      }
    }

    // Validar que no se envíen tanto services como products al mismo tiempo
    const { services } = data || {};
    if (services !== undefined && products !== undefined) {
      errors.push('No se puede enviar tanto services como products al mismo tiempo. Use solo uno de los dos.');
    }

    // Validar services si viene
    if (services !== undefined) {
      if (!Array.isArray(services)) {
        errors.push('services debe ser un arreglo');
      } else {
        services.forEach((s, idx) => {
          if (!s || s.descripcion === undefined || s.importe === undefined || s.cantidad === undefined || s.unidadMedida === undefined) {
            errors.push(`services[${idx}] debe incluir descripcion, importe, cantidad y unidadMedida`);
            return;
          }
          if (typeof s.descripcion !== 'string' || s.descripcion.length < 1) errors.push(`services[${idx}].descripcion inválida`);
          const imp = parseFloat(s.importe);
          if (Number.isNaN(imp) || imp < 0 || imp > 999999.99) errors.push(`services[${idx}].importe inválido`);
          const cant = parseInt(s.cantidad, 10);
          if (Number.isNaN(cant) || cant < 1) errors.push(`services[${idx}].cantidad inválida`);
        });
      }
    }

    // Validar products si viene
    if (products !== undefined) {
      if (!Array.isArray(products)) {
        errors.push('products debe ser un arreglo');
      } else {
        const invalid = products.some((p) => !p || p.id_producto === undefined || p.cantidad === undefined);
        if (invalid) {
          errors.push('Al menos un producto no tiene la estructura correcta (debe incluir id_producto y cantidad)');
        } else {
          // Validar que todos los productos existan y tengan cantidad válida
          for (const product of products) {
            const idProductoNum = parseInt(product.id_producto, 10);
            if (Number.isNaN(idProductoNum) || idProductoNum <= 0) {
              errors.push(`ID de producto inválido: ${product.id_producto}`);
            } else {
              const productoOk = await productoExists(idProductoNum);
              if (!productoOk) {
                errors.push(`El producto con ID ${idProductoNum} no existe`);
              }
            }

            const cantidadNum = parseFloat(product.cantidad);
            if (Number.isNaN(cantidadNum) || cantidadNum < 0) {
              errors.push(`Cantidad inválida para producto ${product.id_producto}: ${product.cantidad} (debe ser un número decimal mayor o igual a 0)`);
            }
          }

          // Validar que todos los productos tengan suficiente stock disponible
          if (errors.length === 0) {
            const contratoIdParaValidar = id_contrato !== undefined ? parseInt(id_contrato, 10) : factura.id_contrato;
            const contrato = await Contrato.findOne({ where: { id_contrato: contratoIdParaValidar } });
            if (contrato && contrato.ClienteOProveedor === 'Cliente') {
              for (const product of products) {
                const idProductoNum = parseInt(product.id_producto, 10);
                const producto = await Producto.findOne({ where: { id_producto: idProductoNum } });
                const cantidadNum = parseFloat(product.cantidad);

                if (producto && producto.cantidadExistencia < cantidadNum) {
                  errors.push(`La cantidad en existencia del producto ${producto.nombre} es insuficiente: ${producto.cantidadExistencia}`);
                }
              }
            }

            // Validar precio y costo si se proporcionan y el contrato es Proveedor
            if (contrato && contrato.ClienteOProveedor === 'Proveedor') {
              for (const product of products) {
                if (product.precio !== undefined) {
                  const precioNum = parseFloat(product.precio);
                  if (Number.isNaN(precioNum) || precioNum < 0) {
                    errors.push(`Precio inválido para producto ${product.id_producto}: debe ser un número >= 0`);
                  }
                }
                if (product.costo !== undefined) {
                  const costoNum = parseFloat(product.costo);
                  if (Number.isNaN(costoNum) || costoNum < 0) {
                    errors.push(`Costo inválido para producto ${product.id_producto}: debe ser un número >= 0`);
                  }
                }
              }
            }
          }
        }
      }
    }

    if (errors.length > 0) return { errors };

    // Obtener el contrato nuevo para los nuevos productos
    const contratoNuevo = await Contrato.findOne({ where: { id_contrato: updateData.id_contrato || factura.id_contrato } });

    // Transacción: actualizar factura, reemplazar servicios y productos si se envían
    await sequelize.transaction(async (t) => {
      await factura.update(updateData, { transaction: t });
      if (services !== undefined) {
        await Servicio.destroy({ where: { id_factura: factura.id_factura } }, { transaction: t });
        if (Array.isArray(services) && services.length > 0) {
          const serviciosData = services.map((s) => ({
            descripcion: s.descripcion,
            cantidad: parseInt(s.cantidad, 10),
            importe: parseFloat(s.importe),
            unidadMedida: s.unidadMedida,
            id_factura: factura.id_factura,
          }));
          await Servicio.bulkCreate(serviciosData, { transaction: t });
        }
      }
      if (products !== undefined) {
        // Obtener productos anteriores para restaurar inventario
        const productosAnteriores = await FacturaProducto.findAll({
          where: { id_factura: factura.id_factura },
          transaction: t
        });

        // Restaurar inventario de productos anteriores basado en el tipo de contrato
        const contrato = await Contrato.findOne({ where: { id_contrato: factura.id_contrato } });
        for (const prodAnterior of productosAnteriores) {
          if (contrato && contrato.ClienteOProveedor === 'Cliente') {
            // Para contratos de Cliente: incrementar inventario (restaurar lo decrementado)
            await Producto.increment('cantidadExistencia', {
              by: prodAnterior.cantidad,
              where: { id_producto: prodAnterior.id_producto },
              transaction: t
            });
          } else if (contrato && contrato.ClienteOProveedor === 'Proveedor') {
            // Para contratos de Proveedor: decrementar inventario (restaurar lo incrementado)
            await Producto.decrement('cantidadExistencia', {
              by: prodAnterior.cantidad,
              where: { id_producto: prodAnterior.id_producto },
              transaction: t
            });
          }
        }

        await FacturaProducto.destroy({ where: { id_factura: factura.id_factura } }, { transaction: t });
        if (Array.isArray(products) && products.length > 0) {
          // Obtener productos con sus datos para precioVenta y costoVenta
          const productosConDatos = await Promise.all(products.map(async (p) => {
            const producto = await Producto.findOne({ where: { id_producto: parseInt(p.id_producto, 10) } });
            return {
              id_factura: factura.id_factura,
              id_producto: parseInt(p.id_producto, 10),
              cantidad: parseFloat(p.cantidad),
              precioVenta: (contratoNuevo && contratoNuevo.ClienteOProveedor === 'Proveedor' && p.precio !== undefined) ? parseFloat(p.precio) : producto.precio,
              costoVenta: (contratoNuevo && contratoNuevo.ClienteOProveedor === 'Proveedor' && p.costo !== undefined) ? parseFloat(p.costo) : producto.costo,
            };
          }));

          await FacturaProducto.bulkCreate(productosConDatos, { transaction: t });

          // Actualizar inventario de productos nuevos basado en el tipo de contrato
          for (const p of products) {
            const idProducto = parseInt(p.id_producto, 10);
            const cantidad = parseFloat(p.cantidad);

            if (contratoNuevo && contratoNuevo.ClienteOProveedor === 'Cliente') {
              // Para contratos de Cliente: decrementar inventario
              await Producto.decrement('cantidadExistencia', {
                by: cantidad,
                where: { id_producto: idProducto },
                transaction: t
              });
            } else if (contratoNuevo && contratoNuevo.ClienteOProveedor === 'Proveedor') {
              // Para contratos de Proveedor: incrementar inventario
              await Producto.increment('cantidadExistencia', {
                by: cantidad,
                where: { id_producto: idProducto },
                transaction: t
              });
            }
          }

          // Crear entradas si el contrato nuevo es Proveedor
          if (contratoNuevo && contratoNuevo.ClienteOProveedor === 'Proveedor') {
            const entradasData = products.map(p => {
              const productoData = productosConDatos.find(pd => pd.id_producto === parseInt(p.id_producto, 10));
              return {
                id_factura: factura.id_factura,
                id_contrato: updateData.id_contrato || factura.id_contrato,
                id_producto: parseInt(p.id_producto, 10),
                cantidadEntrada: parseFloat(p.cantidad),
                costo: p.costo !== undefined ? parseFloat(p.costo) : productoData.costoVenta,
                fecha: new Date(),
                nota: '',
              };
            });
            await Entrada.bulkCreate(entradasData, { transaction: t });
          }
        }
      }
    });

    return { data: factura };
  } catch (error) {
    console.error('Error en updateFactura:', error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al actualizar factura');
      err.errors = [error.message || 'Error interno al actualizar factura'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

const deleteFactura = async (id) => {
  try {
    const factura = await Factura.findOne({ where: { id_factura: id } });
    if (!factura) return false;

    // Transacción: restaurar inventario y eliminar factura
    await sequelize.transaction(async (t) => {
      // Obtener productos asociados a la factura para restaurar inventario
      const productosFactura = await FacturaProducto.findAll({
        where: { id_factura: id },
        transaction: t
      });

      // Restaurar inventario de productos basado en el tipo de contrato
      const contrato = await Contrato.findOne({ where: { id_contrato: factura.id_contrato } });
      for (const prodFactura of productosFactura) {
        if (contrato && contrato.ClienteOProveedor === 'Cliente') {
          // Para contratos de Cliente: incrementar inventario (restaurar lo decrementado)
          await Producto.increment('cantidadExistencia', {
            by: prodFactura.cantidad,
            where: { id_producto: prodFactura.id_producto },
            transaction: t
          });
        } else if (contrato && contrato.ClienteOProveedor === 'Proveedor') {
          // Para contratos de Proveedor: decrementar inventario (remover lo incrementado)
          await Producto.decrement('cantidadExistencia', {
            by: prodFactura.cantidad,
            where: { id_producto: prodFactura.id_producto },
            transaction: t
          });
        }
      }

      // Eliminar la factura (esto también elimina automáticamente los registros relacionados por CASCADE)
      await factura.destroy({ transaction: t });
    });

    return true;
  } catch (error) {
    console.error('Error en deleteFactura:', error);
    throw error;
  }
};

const filterFacturas = async (filters, page = 1, limit = 10) => {
  try {
    const where = {};
    const include = baseIncludes();

    if (filters.id_contrato) {
      const idContrato = parseInt(filters.id_contrato, 10);
      if (!Number.isNaN(idContrato)) where.id_contrato = idContrato;
    }

    if (filters.id_trabajador_autorizado) {
      const idTA = parseInt(filters.id_trabajador_autorizado, 10);
      if (!Number.isNaN(idTA)) where.id_trabajador_autorizado = idTA;
    }

    if (filters.id_usuario) {
      const idU = parseInt(filters.id_usuario, 10);
      if (!Number.isNaN(idU)) where.id_usuario = idU;
    }

    if (filters.num_consecutivo) {
      const num = parseInt(filters.num_consecutivo, 10);
      if (!Number.isNaN(num)) where.num_consecutivo = num;
    }

    if (filters.estado) {
      where.estado = filters.estado;
    }

    if (filters.fecha_desde || filters.fecha_hasta) {
      where.fecha = {};
      if (filters.fecha_desde) where.fecha[Op.gte] = new Date(filters.fecha_desde);
      if (filters.fecha_hasta) where.fecha[Op.lte] = new Date(filters.fecha_hasta);
    }

    if (filters.id_entidad) {
      const idEntidad = parseInt(filters.id_entidad, 10);
      if (!Number.isNaN(idEntidad)) {
        // Add where on nested include Contrato->Entidad
        const contratoInc = include.find(i => i.as === 'contrato');
        contratoInc.where = { id_entidad: idEntidad };
        contratoInc.required = true;
      }
    }

    // Filtrado por atributos de Entidad: consecutivoEntidad y organismoEntidad
    if (filters.consecutivoEntidad || filters.organismoEntidad) {
      // Buscar entidades que coincidan (case-insensitive)
      const entidadWhere = {};
      if (filters.consecutivoEntidad) {
        entidadWhere.consecutivo = sequelize.where(sequelize.fn('LOWER', sequelize.col('consecutivo')), 'LIKE', `${String(filters.consecutivoEntidad).toLowerCase()}`);
      }
      if (filters.organismoEntidad) {
        entidadWhere.organismo = sequelize.where(sequelize.fn('LOWER', sequelize.col('organismo')), 'LIKE', `${String(filters.organismoEntidad).toLowerCase()}`);
      }

      // Obtener IDs de entidades que coincidan
      const entidades = await Entidad.findAll({ where: entidadWhere, attributes: ['id_entidad'] });
      const entidadIds = entidades.map(e => e.id_entidad);

      // Si no hay entidades que coincidan, devolver resultado vacío
      if (!entidadIds || entidadIds.length === 0) {
        return {
          facturas: [],
          pagination: {
            total: 0,
            totalPages: 0,
            currentPage: parseInt(page, 10),
            limit: parseInt(limit, 10),
            hasNextPage: false,
            hasPrevPage: false,
          }
        };
      }

      // Añadir filtro para contratos cuyas entidades estén en la lista
      const contratoInc = include.find(i => i.as === 'contrato');
      contratoInc.where = contratoInc.where || {};
      contratoInc.where.id_entidad = { [Op.in]: entidadIds };
      contratoInc.required = true;
    }

    const offset = (page - 1) * limit;

    const totalCount = await Factura.count({
      where,
      include,
      distinct: true,
      col: 'id_factura'
    });

    const facturas = await Factura.findAll({
      where,
      include,
      order: [["fecha", "DESC"], ["id_factura", "DESC"]],
      limit: parseInt(limit, 10),
      offset,
    });

    // Obtener todas las facturas filtradas para calcular las sumas
    const allFacturas = await Factura.findAll({
      where,
      include,
      order: [["fecha", "DESC"], ["id_factura", "DESC"]],
    });

    const sums = calculateSums(allFacturas);

    const totalPages = Math.ceil(totalCount / limit) || 1;
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      facturas,
      pagination: {
        total: totalCount,
        totalPages,
        currentPage: parseInt(page, 10),
        limit: parseInt(limit, 10),
        hasNextPage,
        hasPrevPage,
        ...sums,
      },
    };
  } catch (error) {
    console.error('Error en filterFacturas:', error);
    throw error;
  }
};

// Validaciones de existencia de FK
const contratoExists = async (idContrato) => {
  try {
    const c = await Contrato.findOne({ where: { id_contrato: idContrato } });
    return c !== null;
  } catch (error) {
    console.error('Error en contratoExists:', error);
    throw error;
  }
};

const trabajadorAutorizadoExists = async (idTA) => {
  try {
    const t = await TrabajadorAutorizado.findOne({ where: { id_trabajador_autorizado: idTA } });
    return t !== null;
  } catch (error) {
    console.error('Error en trabajadorAutorizadoExists:', error);
    throw error;
  }
};

const usuarioExists = async (idUsuario) => {
  try {
    const u = await Usuario.findOne({ where: { id_usuario: idUsuario } });
    return u !== null;
  } catch (error) {
    console.error('Error en usuarioExists:', error);
    throw error;
  }
};

const productoExists = async (idProducto) => {
  try {
    const p = await Producto.findOne({ where: { id_producto: idProducto } });
    return p !== null;
  } catch (error) {
    console.error('Error en productoExists:', error);
    throw error;
  }
};

// Función para validar que el número consecutivo sea único por año para contratos de tipo "Cliente"
const validarNumeroConsecutivoUnico = async (numConsecutivo, fecha, idContrato, idFacturaExcluir = null) => {
  try {
    // Obtener el contrato para verificar si es de tipo "Cliente"
    const contrato = await Contrato.findOne({ where: { id_contrato: idContrato } });
    if (!contrato) return { valido: false, mensaje: "El contrato especificado no existe" };
    
    // Si el contrato no es de tipo "Cliente", no aplicar la validación
    if (contrato.ClienteOProveedor !== 'Cliente') {
      return { valido: true, mensaje: "Validación no aplica para contratos de tipo Proveedor" };
    }
    
    // Extraer el año de la fecha
    const añoFactura = new Date(fecha).getFullYear();
    
    // Construir la condición WHERE
    const whereCondition = {
      num_consecutivo: numConsecutivo,
      '$contrato.ClienteOProveedor$': 'Cliente',
      [Op.and]: [
        sequelize.where(
          sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM "factura"."fecha"')),
          añoFactura
        )
      ]
    };
    
    // Si estamos actualizando, excluir la factura actual
    if (idFacturaExcluir) {
      whereCondition.id_factura = { [Op.ne]: idFacturaExcluir };
    }
    
    // Buscar facturas que cumplan con los criterios
    const facturaExistente = await Factura.findOne({
      where: whereCondition,
      include: [{
        model: Contrato,
        as: 'contrato',
        attributes: ['ClienteOProveedor']
      }]
    });
    
    if (facturaExistente) {
      return { 
        valido: false, 
        mensaje: `Ya existe una factura con número consecutivo ${numConsecutivo} en el año ${añoFactura} para un contrato de tipo Cliente` 
      };
    }
    
    return { valido: true, mensaje: "Número consecutivo válido" };
  } catch (error) {
    console.error('Error en validarNumeroConsecutivoUnico:', error);
    throw error;
  }
};

// Validar que la fecha de la factura actual sea mayor que la fecha de la factura con consecutivo anterior (numConsecutivo - 1)
const validarOrdenConsecutivoFecha = async (numConsecutivo, fecha, idContrato) => {
  try {
    if (!numConsecutivo || numConsecutivo <= 1) return { valido: true, mensaje: 'No aplica validación para consecutivo 1 o inválido' };

    const contrato = await Contrato.findOne({ where: { id_contrato: idContrato } });
    if (!contrato) return { valido: false, mensaje: 'El contrato especificado no existe' };
    if (contrato.ClienteOProveedor !== 'Cliente') return { valido: true, mensaje: 'Validación no aplica para contratos de tipo Proveedor' };

    const añoFactura = new Date(fecha).getFullYear();
    const consecutivoAnterior = numConsecutivo - 1;

    // Buscar factura anterior con el mismo año y tipo Cliente
    const whereCondition = {
      num_consecutivo: consecutivoAnterior,
      '$contrato.ClienteOProveedor$': 'Cliente',
      [Op.and]: [
        sequelize.where(
          sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM "factura"."fecha"')),
          añoFactura
        )
      ]
    };

    const facturaAnterior = await Factura.findOne({
      where: whereCondition,
      include: [{ model: Contrato, as: 'contrato', attributes: ['ClienteOProveedor'] }]
    });

    if (!facturaAnterior) return { valido: true, mensaje: 'Factura anterior no encontrada, validación no aplica' };

    const fechaNueva = new Date(fecha);
    const fechaAnterior = new Date(facturaAnterior.fecha);

    if (fechaNueva <= fechaAnterior) {
      return { valido: false, mensaje: `La fecha de la factura ${numConsecutivo} debe ser mayor que la fecha de la factura ${consecutivoAnterior}` };
    }

    return { valido: true, mensaje: 'Orden de fechas correcto' };
  } catch (error) {
    console.error('Error en validarOrdenConsecutivoFecha:', error);
    throw error;
  }
};

// Función para obtener el siguiente número consecutivo disponible para facturas en un año específico
const getNextConsecutivo = async (year) => {
  try {
    // Validar que el año sea válido
    const añoNum = parseInt(year, 10);
    if (Number.isNaN(añoNum) || añoNum < 1900 || añoNum > 2100) {
      throw new Error("El año debe ser un número válido entre 1900 y 2100");
    }

    // Buscar el número consecutivo más alto para facturas en el año especificado (sin filtrar por tipo Cliente)
    const facturaMasAlta = await Factura.findOne({
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM "factura"."fecha"')),
            añoNum
          )
        ]
      },
      order: [['num_consecutivo', 'DESC']]
    });

    // Si no hay facturas en ese año, devolver 1
    if (!facturaMasAlta) {
      return {
        nextConsecutivo: 1,
        message: `No hay facturas en el año ${añoNum}. El siguiente número consecutivo es 1.`
      };
    }

    // Devolver el siguiente número consecutivo
    const nextConsecutivo = facturaMasAlta.num_consecutivo + 1;
    return {
      nextConsecutivo,
      message: `El siguiente número consecutivo disponible para el año ${añoNum} es ${nextConsecutivo}.`
    };
  } catch (error) {
    console.error('Error en getNextConsecutivo:', error);
    throw error;
  }
};

// Función helper para calcular la suma general de una factura
const calcularSumaGeneral = (factura) => {
  let sumaServicios = 0;
  let sumaProductos = 0;
  let sumaCosto = 0;

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
    sumaProductos = factura.productos.reduce((total, producto) => {
      const precio = parseFloat(producto.factura_producto?.precioVenta) || 0;
      const cantidad = parseFloat(producto.factura_producto?.cantidad) || 0;
      return total + (precio * cantidad);
    }, 0);

    // Calcular suma de costo
    sumaCosto = factura.productos.reduce((total, producto) => {
      const costo = parseFloat(producto.factura_producto?.costoVenta) || 0;
      const cantidad = parseFloat(producto.factura_producto?.cantidad) || 0;
      return total + (costo * cantidad);
    }, 0);
  }

  const sumaGeneral = sumaServicios + sumaProductos;

  return {
    suma_servicios: Math.round(sumaServicios * 100) / 100, // Redondear a 2 decimales
    suma_productos: Math.round(sumaProductos * 100) / 100,
    suma_costo: Math.round(sumaCosto * 100) / 100,
    suma_general: Math.round(sumaGeneral * 100) / 100
  };
};

// Función helper para calcular las sumas agregadas de servicios y productos por tipo de contrato y estado
const calculateSums = (facturas) => {
  let serviciosProveedores = 0;
  let serviciosClientes = 0;
  let serviciosProveedoresFacturados = 0;
  let serviciosClientesFacturados = 0;
  let productosProveedor = 0;
  let productosClientes = 0;
  let productosProveedorFacturados = 0;
  let productosClientesFacturados = 0;

  for (const factura of facturas) {
    const tipo = factura.contrato?.ClienteOProveedor;
    const estado = factura.estado;

    // Calcular suma de servicios
    if (factura.servicio && Array.isArray(factura.servicio)) {
      const sumaServ = factura.servicio.reduce((total, s) => {
        const importe = parseFloat(s.importe) || 0;
        const cantidad = parseInt(s.cantidad) || 0;
        return total + (importe * cantidad);
      }, 0);

      if (tipo === 'Proveedor') {
        serviciosProveedores += sumaServ;
        if (estado === 'Facturado') serviciosProveedoresFacturados += sumaServ;
      } else if (tipo === 'Cliente') {
        serviciosClientes += sumaServ;
        if (estado === 'Facturado') serviciosClientesFacturados += sumaServ;
      }
    }

    // Calcular suma de productos
    if (factura.productos && Array.isArray(factura.productos)) {
      const sumaProd = factura.productos.reduce((total, p) => {
        const precio = parseFloat(p.factura_producto?.precioVenta) || 0;
        const cantidad = parseFloat(p.factura_producto?.cantidad) || 0;
        return total + (precio * cantidad);
      }, 0);

      if (tipo === 'Proveedor') {
        productosProveedor += sumaProd;
        if (estado === 'Facturado') productosProveedorFacturados += sumaProd;
      } else if (tipo === 'Cliente') {
        productosClientes += sumaProd;
        if (estado === 'Facturado') productosClientesFacturados += sumaProd;
      }
    }
  }

  return {
    serviciosProveedores: Math.round(serviciosProveedores * 100) / 100,
    serviciosClientes: Math.round(serviciosClientes * 100) / 100,
    serviciosProveedoresFacturados: Math.round(serviciosProveedoresFacturados * 100) / 100,
    serviciosClientesFacturados: Math.round(serviciosClientesFacturados * 100) / 100,
    productosProveedor: Math.round(productosProveedor * 100) / 100,
    productosClientes: Math.round(productosClientes * 100) / 100,
    productosProveedorFacturados: Math.round(productosProveedorFacturados * 100) / 100,
    productosClientesFacturados: Math.round(productosClientesFacturados * 100) / 100,
  };
};

module.exports = {
  getAllFacturas,
  getFacturaById,
  createFactura,
  updateFactura,
  deleteFactura,
  filterFacturas,
  contratoExists,
  trabajadorAutorizadoExists,
  productoExists,
  calcularSumaGeneral,
  validarNumeroConsecutivoUnico,
  getNextConsecutivo,
  usuarioExists,
};


