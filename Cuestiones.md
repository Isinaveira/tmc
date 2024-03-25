-------------------------------------------
Posibles dudas: 
- ¿Cuantos registros por artículo? ¿Un registro por cada zona del almacén y por cada tipo de stock?
- ¿ Todos los datos que se me han dado del almacén son de tienen el tipoStockDesc = "MSR" ? No se va a utilizar nunca la lógica de ZAR -> MSR -> SILO para este conjunto de datos.  

Con respecto a esta duda entiendo que el enunciado está mal redactado y que los datos de stock están en el fichero de prereparto y no en el de stock unificado. 


-------------------------------------------
## DECISIONES
- Uso de streams para no cargar en memoria todo el archivo, si no cargar objeto a objeto y procesarlo. De esta forma el código es escalable para un fichero de gran tamaño. 
- Primero procesar los pedidos y luego buscar los productos que se han pedido, es decir, solo me interesa procesar los productos de los cuales tenga algún pedido. Esto hace al algoritmo más optimo en cuanto a rendimiento, ya que no tiene que procesar productos que no me interesan. 
- Los pedidos que no pueden ser completados no se devuelven en el array de pedidosProcesados. 

## CUESTIONES
1. Describe como implementarías esta solución si tuvieras que acabar mostrando el resultado en un sistema low code. 
    a. Consideraciones de rendimiento
    b. Requisitos que necesitarías del API.

    A - Teniendo en cuenta que lo que se busca es una implementación de un sistema low code, tendrá limitaciones de capacidad de procesamiento y memoria, por lo tanto utilizaría,
    al igual que ahora mismo, streams para procesar el fichero de forma incremental para evitar cargar grandes cantidades de datos en memoria. A lo mejor podría intentar aplicar
    algo de memoria caché para evitar volver a leer archivos de gran tamaño.

    B - Teniendo en cuenta que se trata de un procesado de archivos JSON de gran tamaño, algún endpoint con streams o lectura parcial de un fichero. 
        Esta API además debería de tener operaciones de manejo de datos, filtrado y agrupación. 

2. Si el JSON real de prereparto ocupase 20GB, explica si el problema se trataría de forma distinta y por qué.
    Es muy diferente un json de poco tamaño con un JSON de gran tamaño. A la hora de  leer un JSON de ese calibre, hay que ser muy cuidadoso en cómo procesas los datos.
    En la prueba podría haber cargado en memoria todo el JSON y no habría pasado nada, simplemente cambiando la línea del stream de "data.*" a "data" ya cogería todos los 
    objetos. Sin embargo si ese fichero fuera de 20GB ya habría que considerar el uso de herramientas de Big Data. Para archivos tan grandes es recomendable utilizar procesamiento
    por lotes o incremental como la solución que he utilizado. 

3. Si tuvieras mostrar de forma visual en una pantalla desde que partes de un almacén se rellena un pedido, que propuesta de visualización plantearías teniendo en cuenta que se quiere implementar con una herramienta low code.
   - Diagramas de sectores para representar la cantidad de productos en cada área del almacén.
   - Códigos de colores identificativos de cada parte del almacén y leyendas.
   - Filtros y parámetros personalizables en función del usuario o rol. 

## DUDAS
Revisando los datos me he dado cuenta de que el archivo del almacén (stock_unificado), no tiene stockEm05 ni tampoco ningún tipo de stock diferente a MSR.
¿No sería necesario utilizar los datos del fichero de prereparto? 
 stockZarEm05, stockSiloPaleEm05, ... y buscar en esos datos? 
 Es decir formar las siguiente estructuras y calcular ahí si tengo suficiente stock para completar el pedido? 
  ``` json

  stockEm05: {
    cantidad_total: 200,
    stockZarEm05: 120,
    stockMsrEm05: 80,
    stockSiloPaleEm05: 100
  },
  stockEm01: {
    cantidad_total: 220,
    stockZarEm01: 140,
    stockMsrEm01: 100,
    stockSiloPaleEm01: 80
  }
```
