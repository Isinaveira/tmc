# Datos importantes 

## Ficheros:

### prereparto_bruto.json
Almacena qué artículos deben ser repartidos a tiendas concretas en ciclos de reparto concretos. Los campos relevantes son: 
 ``` json
 {
    key: "identifica el artículo",
    propuesta: "cantidad que debe ser repartida",
    tiendaId: "identifica la tienda a la que se debe hacer el reparto",
    grupoLocalizacionDesc: "identifica el ciclo de reparto",
    esEcommerce: "si la tienda destino es online->1, física-> 0"
 }
 ```

 ### stock_unificado.json
 Datos de stock del almacén, del cual se tirará para hacer el reparto. Los campos relevantes son: 
 ``` json 
 {
    key: "identifica el artículo",
    tipoStockDesc: { 
        ZAR : "zona de alta rotación"
        MSR : "suelo",
        SILO : "SILO"
    },
    stockEm05: "stock en estado 5, exclusivo para peticiones de tiendas online.",
    stockEm01: "stock en estado 1, tiendas físicas y tiendas online siempre que acabe el stockEm05",
    posicioncompleta: "id de la posición donde se encuentra el stock para el artículo indicado en key"
 }
 ``` 

## Normas: 
1.  Para coger elementos del stock: 
    ZAR -> MSR -> SILO , completando el stock con el siguiente paso.
    Ejemplo de salida para cantidad necesaria 10 con ZAR  3 unidades, MSR 2 unidades ,SILO 5 unidades -> {zar: 10, msr: 2, silo: 5}

2. esEcommerce = 1 -> coger stock de stockEm05. Si no es suficiente, stockEm01.

3. Si esEcommerce = 0 -> coger solo el stockEm01.

## Enunciado
Sabiendo que desde el almacén, necesitan saber las posiciones de stock de almacén que deben mover para satisfacer la propuesta de reparto para todas las tiendas y artículos que cumplan:
``` json
{
    grupoLocalizacionDesc: [
        "CICLO 2 GRUPO A2",
        "CICLO 1 GRUPO B",
        "CICLO 1 GRUPO A2"
    ],
    esEcommerce: 1
}
```
Devolver una tabla con los siguientes campos: 
``` json
{
    key: "artículo a repartir",
    idTienda , //tienda a la que se reparte
    propuesta, //cantidad de artículos a repartir
    tipoStockDesc, // zona del almacen de la que sale
    EstadoStock: [1,5], //campo que indica el tipo de stock que ha usado
    posicioncompleta //id posicion en el almacén
}
```
