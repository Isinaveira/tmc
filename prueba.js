const fs = require('fs');
const JSONStream = require('JSONStream');
const es = require('event-stream');



const tiposArchivo = {
    prerepartoBruto: {
        nombreArchivo: './Prereparto_bruto.json',
        tipoArchivo: 'prereparto'
    },
    stockUnificado: {
       nombreArchivo: './Stock_unificado.json',
       tipoArchivo: 'stockUnificado'
    } 
}

/*
Función para procesar ambos JSON en la cual se utiliza Streams para no 
cargar el archivo entero en memoria
*/

function procesarArchivoPrerepartoBruto(archivo) {
    return new Promise((resolve, reject) => {
        let pedidosPrereparto = [];
        const stream = fs.createReadStream(archivo, {encoding: 'utf-8'});
        const parser = JSONStream.parse('data.*'); //Cada objeto de data [] por separado  
        stream.pipe(parser)
              .pipe(es.mapSync(function(data) {
                if((data.esEcommerce === 1) && 
                (data.grupoLocalizacionDesc === "CICLO 2 GRUPO A2" ||
                data.grupoLocalizacionDesc === "CICLO 1 GRUPO B" || 
                data.grupoLocalizacionDesc === "CICLO 1 GRUPO A2")){
                    pedidosPrereparto.push({
                    key: data.key,
                    propuesta: data.propuesta,
                    tiendaId: data.tiendaId,
                    grupoLocalizacionDesc: data.grupoLocalizacionDesc,
                    esEcommerce: data.esEcommerce
                    });   
                }}))
              .on('end', () => {
                 resolve(pedidosPrereparto);
              })
              .on('error', (error) => {
                 reject(error);
              })
        
    })
}

function procesarArchivoStockUnificado(archivo, productosPrereparto) {
    return new Promise((resolve, reject) => {
        let productosPedidos = [];
        const stream = fs.createReadStream(archivo, {encoding: 'utf-8'});
        const parser = JSONStream.parse('data.*'); //Cada objeto de data [] por separado  
        stream.pipe(parser)
              .pipe(es.mapSync(function(data) {
                if(productosPrereparto.some(pedido => pedido.key === data.key)){ //compruebo si hay algún pedido para ese producto
                    productosPedidos.push({
                        key: data.key,
                        tipoStockDesc: data.tipoStockDesc,
                        stockEm05: data.stockEm05,
                        stockEm01: data.stockEm01,
                        posicioncompleta: data.posicioncompleta 
                    })

                }
              }))
              .on('end', () => {
                 resolve(productosPedidos);
              })
              .on('error', (error) => {
                 reject(error);
              })
        
    })
}

function procesaPedidos(productosPedidosStock, productosPrereparto){
    return new Promise((resolve, reject) => {
        let pedidosProcesados = [];
        let pedidosNoProcesados = [];
        
        productosPrereparto.forEach(productoPedido => {
           let stockDelProductoPedido =  productosPedidosStock.filter(productoEnStock => (productoPedido.key === productoEnStock.key));
           if(stockDelProductoPedido.length != 0){
               let stockTotal = stockDelProductoPedido.reduce((acc, producto) => {
                return acc + producto.stockEm01 + producto.stockEm05; 
                }, 0); 
               
               if( stockTotal < productoPedido.propuesta){
                    console.log("No hay stock");
                    
                }else{
                    let winner = stockDelProductoPedido.find( stock => productoPedido.propuesta <= stock.stockEm05);
                    // si hay, entrega el primero, 
                    if( winner ) {
                        pedidosProcesados.push({
                            key: winner.key,
                            idTienda: productoPedido.idTienda,
                            propuesta: productoPedido.propuesta,
                            tipoStockDesc: winner.tipoStockDesc,
                            EstadoStock: 5,
                            posicionCompleta: winner.posicionCompleta
                        })
                    }else {
                        let winner = stockDelProductoPedido.find( stock => productoPedido.propuesta <= stock.stockEm01);
                        if(winner){
                            pedidosProcesados.push({
                                key: winner.key,
                                idTienda: productoPedido.idTienda,
                                propuesta: productoPedido.propuesta,
                                tipoStockDesc: winner.tipoStockDesc,
                                EstadoStock: 1,
                                posicionCompleta: winner.posicioncompleta
                            })  
                        }
                    }
                }
           }
        })
        resolve({pedidosProcesados});            
    })
}

async function procesarArchivos() {
    let pedidosProcesados = [];
    let pedidosNoProcesados = []
    try {
        // Cargar pedidos presentes en prereparto
        const productosPrereparto = await procesarArchivoPrerepartoBruto(tiposArchivo.prerepartoBruto.nombreArchivo);
        // Procesar el archivo de stock unificado utilizando solo los productos presentes en el prereparto
        const productosPedidosStock = await procesarArchivoStockUnificado(tiposArchivo.stockUnificado.nombreArchivo,productosPrereparto);
        await procesaPedidos(productosPedidosStock, productosPrereparto).then(({ pedidosProcesados}) => {
            generarTabla(pedidosProcesados);
        }).catch(error => {
            console.error("Ocurrió un error:", error);
        });
        
        console.log('Procesamiento completado para el stock unificado utilizando solo los productos presentes en el prereparto. Solo se muestran los pedidos para los que hay stock');
    } catch (error) {
        console.error('Ocurrió un error durante el procesamiento:', error);
    }
}
  
function generarTabla(arrayDeObjetos) {
    // Obtenemos los nombres de las propiedades como encabezados de columna
    const columnas = Object.keys(arrayDeObjetos[0]);

    // Función auxiliar para imprimir una línea horizontal
    function imprimirLineaHorizontal(longitud) {
        console.log('─'.repeat(longitud));
    }

    // Imprimir la fila de encabezados
    imprimirLineaHorizontal(columnas.length * 15); // Ajusta la longitud a tu gusto
    console.log('| ' + columnas.map(columna => columna.padEnd(12)).join(' | ') + ' |');
    imprimirLineaHorizontal(columnas.length * 15); // Ajusta la longitud a tu gusto

    // Iteramos sobre cada objeto en el array
    arrayDeObjetos.forEach(objeto => {
        // Imprimir los valores de cada fila
        console.log('| ' + columnas.map(columna => String(objeto[columna]).padEnd(12)).join(' | ') + ' |');
        imprimirLineaHorizontal(columnas.length * 15); // Ajusta la longitud a tu gusto
    });
}

//Llamara a la función principal para comenzar el procesamiento
procesarArchivos();




