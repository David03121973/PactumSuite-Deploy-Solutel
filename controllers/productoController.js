// controllers/productoController.js
const productoService = require('../services/productoService');

/**
 * Obtener todos los productos
 */
const getProductos = async (req, res) => {
    try {
        // Obtener los productos desde el servicio
        const productos = await productoService.getAllProductos();

        // Verificar si hay productos
        if (!productos || productos.length === 0) {
            return res.status(200).json([]); // Retornar un array vacío si no hay productos
        }

        return res.status(200).json(productos); // Retornar la lista de productos
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        return res.status(500).json({ errors: ["Error al obtener los productos"] });
    }
};

/**
 * Obtener un producto por ID
 */
const getProductoById = async (req, res) => {
    const { id } = req.params; // Obtener el ID del producto desde los parámetros
    try {
        const producto = await productoService.getProductoById(id);

        // Verificar si el producto fue encontrado
        if (!producto) {
            return res.status(404).json({ errors: ["Producto no encontrado"] });
        }

        return res.status(200).json(producto); // Retornar el producto encontrado
    } catch (error) {
        console.error("Error al obtener el producto:", error);
        return res.status(500).json({ errors: ["Error al obtener el producto"] });
    }
};

/**
 * Crear un nuevo producto
 */
const createProducto = async (req, res) => {
  const { codigo, nombre, precio, costo, nota, unidadMedida, tipoProducto, cantidadExistencia } = req.body;
  const errors = [];

  // Validar campos requeridos
  if (!codigo || !nombre || precio === undefined || costo === undefined || !unidadMedida || !tipoProducto) {
    errors.push("Los campos obligatorios son: codigo, nombre, precio, costo, unidadMedida, tipoProducto");
  }

  // Validar formato del código
  if (codigo) {
    if (codigo.length < 2 || codigo.length > 20) {
      errors.push("El código debe tener entre 2 y 20 caracteres");
    }
    if (!/^[A-Za-z0-9_-]+$/.test(codigo)) {
      errors.push("El código solo puede contener letras, números, guiones y guiones bajos");
    }
  }

  // Validar formato del nombre
  if (nombre) {
    if (nombre.length < 2 || nombre.length > 100) {
      errors.push("El nombre debe tener entre 2 y 100 caracteres");
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_.,()]+$/.test(nombre)) {
      errors.push("El nombre contiene caracteres no válidos");
    }
  }

  // Validar precio
  if (precio !== undefined) {
    if (typeof precio !== 'number' && typeof precio !== 'string') {
      errors.push("El precio debe ser un número");
    } else {
      const precioNum = parseFloat(precio);
      if (isNaN(precioNum)) {
        errors.push("El precio debe ser un número válido");
      } else if (precioNum < 0) {
        errors.push("El precio no puede ser negativo");
      } else if (precioNum > 999999.99) {
        errors.push("El precio no puede ser mayor a 999,999.99");
      }
    }
  }

  // Validar costo
  if (costo !== undefined) {
    if (typeof costo !== 'number' && typeof costo !== 'string') {
      errors.push("El costo debe ser un número");
    } else {
      const costoNum = parseFloat(costo);
      if (isNaN(costoNum)) {
        errors.push("El costo debe ser un número válido");
      } else if (costoNum < 0) {
        errors.push("El costo no puede ser negativo");
      } else if (costoNum > 999999.99) {
        errors.push("El costo no puede ser mayor a 999,999.99");
      }
    }
  }

  // Validar unidadMedida
  if (unidadMedida) {
    if (unidadMedida.length < 1 || unidadMedida.length > 50) {
      errors.push("La unidad de medida debe tener entre 1 y 50 caracteres");
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_.,()/]+$/.test(unidadMedida)) {
      errors.push("La unidad de medida contiene caracteres no válidos");
    }
  }

  // Validar nota (opcional)
  if (nota && nota.length > 500) {
    errors.push("La nota no puede tener más de 500 caracteres");
  }

  // Validar tipoProducto
  if (tipoProducto) {
    if (tipoProducto.length < 1 || tipoProducto.length > 100) {
      errors.push("El tipo de producto debe tener entre 1 y 100 caracteres");
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_.,()]+$/.test(tipoProducto)) {
      errors.push("El tipo de producto contiene caracteres no válidos");
    }
  }

  // Validar cantidadExistencia (opcional, pero si se proporciona, validar)
  if (cantidadExistencia !== undefined) {
    if (typeof cantidadExistencia !== 'number' && typeof cantidadExistencia !== 'string') {
      errors.push("La cantidad de existencia debe ser un número");
    } else {
      const cantidadNum = parseFloat(cantidadExistencia);
      if (isNaN(cantidadNum)) {
        errors.push("La cantidad de existencia debe ser un número válido");
      } else if (cantidadNum < 0) {
        errors.push("La cantidad de existencia no puede ser negativa");
      } else if (cantidadNum > 999999.99) {
        errors.push("La cantidad de existencia no puede ser mayor a 999,999.99");
      }
    }
  }

  // Si hay errores de validación, retornarlos todos juntos
  if (errors.length > 0) {
    return res.status(400).json({
      errors: errors
    });
  }

  // Verificar si el código ya existe
  try {
    const productoExists = await productoService.productoExists(codigo);
    if (productoExists) {
      return res.status(400).json({
        errors: [`Ya existe un producto con el código: ${codigo}`]
      });
    }
  } catch (error) {
    console.error("Error al verificar el código del producto:", error);
    return res.status(500).json({
      errors: ["Error al crear el producto"]
    });
  }

  const productoData = {
    codigo,
    nombre,
    precio: parseFloat(precio),
    costo: parseFloat(costo),
    nota: nota || null,
    unidadMedida,
    tipoProducto,
    cantidadExistencia: 0.00 // Siempre 0.00 al crear, ignorar si se proporciona
  };
  
  try {
    const newProducto = await productoService.createProducto(productoData);
    return res.status(201).json({
      data: {
        id_producto: newProducto.id_producto,
        codigo: newProducto.codigo,
        nombre: newProducto.nombre,
        precio: newProducto.precio,
        nota: newProducto.nota,
        unidadMedida: newProducto.unidadMedida,
        tipoProducto: newProducto.tipoProducto,
        cantidadExistencia: newProducto.cantidadExistencia
      }
    });
  } catch (error) {
    console.error("Error al crear el producto:", error);
    return res.status(500).json({
      errors: ["Error al crear el producto"]
    });
  }
};

/**
 * Actualizar un producto
 */
const updateProducto = async (req, res) => {
    const { id } = req.params;
    const { codigo, nombre, precio, costo, nota, unidadMedida, tipoProducto, cantidadExistencia } = req.body;
    const errors = [];

    // Validar que se proporcione al menos un campo para actualizar
    if (!codigo && !nombre && precio === undefined && costo === undefined && !nota && !unidadMedida && !tipoProducto && cantidadExistencia === undefined) {
      return res.status(400).json({
        errors: ["Se debe proporcionar al menos un campo para actualizar: codigo, nombre, precio, costo, nota, unidadMedida, tipoProducto o cantidadExistencia"]
      });
    }

    // Validar formato del código si se proporciona
    if (codigo) {
      if (codigo.length < 2 || codigo.length > 20) {
        errors.push("El código debe tener entre 2 y 20 caracteres");
      }
      if (!/^[A-Za-z0-9_-]+$/.test(codigo)) {
        errors.push("El código solo puede contener letras, números, guiones y guiones bajos");
      }
    }

    // Validar formato del nombre si se proporciona
    if (nombre) {
      if (nombre.length < 2 || nombre.length > 100) {
        errors.push("El nombre debe tener entre 2 y 100 caracteres");
      }
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_.,()]+$/.test(nombre)) {
        errors.push("El nombre contiene caracteres no válidos");
      }
    }

    // Validar precio si se proporciona
    if (precio !== undefined) {
      if (typeof precio !== 'number' && typeof precio !== 'string') {
        errors.push("El precio debe ser un número");
      } else {
        const precioNum = parseFloat(precio);
        if (isNaN(precioNum)) {
          errors.push("El precio debe ser un número válido");
        } else if (precioNum < 0) {
          errors.push("El precio no puede ser negativo");
        } else if (precioNum > 999999.99) {
          errors.push("El precio no puede ser mayor a 999,999.99");
        }
      }
    }

    // Validar nota si se proporciona
    if (nota && nota.length > 500) {
      errors.push("La nota no puede tener más de 500 caracteres");
    }

    // Validar unidadMedida si se proporciona
    if (unidadMedida !== undefined) {
      if (unidadMedida.length < 1 || unidadMedida.length > 50) {
        errors.push("La unidad de medida debe tener entre 1 y 50 caracteres");
      }
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_.,()/]+$/.test(unidadMedida)) {
        errors.push("La unidad de medida contiene caracteres no válidos");
      }
    }

    // Validar cantidadExistencia si se proporciona
    if (cantidadExistencia !== undefined) {
      if (typeof cantidadExistencia !== 'number' && typeof cantidadExistencia !== 'string') {
        errors.push("La cantidad de existencia debe ser un número");
      } else {
        const cantidadNum = parseFloat(cantidadExistencia);
        if (isNaN(cantidadNum)) {
          errors.push("La cantidad de existencia debe ser un número válido");
        } else if (cantidadNum < 0) {
          errors.push("La cantidad de existencia no puede ser negativa");
        } else if (cantidadNum > 999999.99) {
          errors.push("La cantidad de existencia no puede ser mayor a 999,999.99");
        }
      }
    }

    // Si hay errores de validación, retornarlos todos juntos
    if (errors.length > 0) {
      return res.status(400).json({
        errors: errors
      });
    }
    
    try {
      // Verificar si el producto existe
      const producto = await productoService.getProductoById(id);
      if (!producto) {
        return res.status(404).json({ errors: ["Producto no encontrado"] });
      }
  
      // Preparar los datos para la actualización
      const updatedProductoData = {};
  
      // Actualizar cada campo solo si se proporciona
      if (codigo) {
        // Verificar si el nuevo código ya existe (excepto para el mismo producto)
        const productoExists = await productoService.productoExists(codigo);
        if (productoExists && producto.codigo !== codigo) {
          return res.status(400).json({
            errors: [`Ya existe un producto con el código: ${codigo}`]
          });
        }
        updatedProductoData.codigo = codigo;
      }
  
      if (nombre) {
        updatedProductoData.nombre = nombre;
      }
  
      if (precio !== undefined) {
        updatedProductoData.precio = parseFloat(precio);
      }
  
      if (nota !== undefined) {
        updatedProductoData.nota = nota;
      }

      if (unidadMedida !== undefined) {
        updatedProductoData.unidadMedida = unidadMedida;
      }

      if (cantidadExistencia !== undefined) {
        updatedProductoData.cantidadExistencia = parseFloat(cantidadExistencia);
      }

      // Actualizar el producto
      const updatedProducto = await productoService.updateProducto(id, updatedProductoData);
      if (!updatedProducto) {
        return res.status(500).json({ errors: ["No se pudo actualizar el producto"] });
      }
  
      // Obtener el producto actualizado
      const updatedProduct = await productoService.getProductoById(id);
      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      return res.status(500).json({ errors: ["Error al actualizar el producto"] });
    }
};

/**
 * Eliminar un producto
 */
const deleteProducto = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Verificar si el producto existe antes de intentar eliminarlo
        const producto = await productoService.getProductoById(id);
        if (!producto) {
            return res.status(404).json({ 
                errors: ["Producto no encontrado"] 
            });
        }

        // Intentar eliminar el producto
        const result = await productoService.deleteProducto(id);
        
        if (!result) {
            return res.status(500).json({ 
                errors: ["Error al eliminar el producto"] 
            });
        }

        return res.status(200).json({ 
            producto: {
                id_producto: producto.id_producto,
                codigo: producto.codigo,
                nombre: producto.nombre
            }
        });
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        return res.status(500).json({ 
            errors: ["Error al eliminar el producto"]
        });
    }
};

/**
 * Filtrar productos por múltiples criterios con paginación
 */
const filterProductos = async (req, res) => {
  try {
    const filters = req.body;
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 10;

    // Validar parámetros de paginación
    if (page < 1) {
      return res.status(400).json({
        errors: ["El número de página debe ser mayor a 0"]
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        errors: ["El límite debe estar entre 1 y 100"]
      });
    }

    const result = await productoService.filterProductos(filters, page, limit);
    
    res.status(200).json({
      data: result.productos,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error en el controlador al filtrar productos:', error);
    res.status(500).json({
      errors: ["Error al filtrar productos"]
    });
  }
};

/**
 * Obtener un producto por código
 */
const getProductoByCodigo = async (req, res) => {
    const { codigo } = req.params;
    try {
        const producto = await productoService.getProductoByCodigo(codigo);

        // Verificar si el producto fue encontrado
        if (!producto) {
            return res.status(404).json({ errors: ["Producto no encontrado"] });
        }

        return res.status(200).json(producto); // Retornar el producto encontrado
    } catch (error) {
        console.error("Error al obtener el producto:", error);
        return res.status(500).json({ errors: ["Error al obtener el producto"] });
    }
};

module.exports = {
    getProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto,
    filterProductos,
    getProductoByCodigo,
};
