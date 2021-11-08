const {doc} = require('../google_services/index')
const axios = require('axios')
const {addCell} = require('../google_services/actions')


async function getAllOrders(){
    await doc.loadInfo();
    const sheet = doc.sheetsById[127077982]
    const rows = await sheet.getRows()

    let arrayExcel = []
    rows.forEach((r,index) => {
        arrayExcel.push(r.order_id)
    })
    return arrayExcel

}

async function checkArchive(){

    let archiveArray = []
    const arrayExcel = await getAllOrders()
    console.log('Total number of orders in our excel: ' + arrayExcel.length)

    const headers = {
        'Content-Type': 'application/json',
        'X-Auth-Token':'xAVpheE7v6RFLHShixjAfjTlTG+jvTUk9ZvR65mWxow='
    }

    console.log('checking ARCHIVE orders')
    axios.get('https://kaspi.kz/shop/api/v2/orders?page[number]=0&page[size]=1000&'+
    'filter[orders][state]=DELIVERY&filter[orders][creationDate][$ge]=1609702565000', {
        headers: headers
    })
    .then(async response=>{
        const data = await response.data.data
        if(data.length!==0){
            data.forEach(async order=>{
                archiveArray.push(order.attributes.code)
                console.log(order.attributes.code)
            }) 
            

            console.log('Total number of comleted orders from archive: ' + archiveArray.length)
            
            // await doc.loadInfo();
            // const sheet = doc.sheetsById[127077982]
            // const rows = await sheet.getRows()
    
    
            // var row, index = rows.length - 1;
            // // let rowIndex
            // for ( ; index >= 0; index--) {
            //     for(o of archiveArray){
            //         if (rows[index].order_id == o) {
            //             row = rows[index];
            //             if(row['Дата выдачи']===''){
            //                 console.log(rows[index].order_id );
            //             }
            //             // rowIndex = index
            //             break;
            //         }
            //     }
            // }
        }  

        var array_difference = archiveArray.filter(function(x) {
            // checking second array does not contain element "x"
            if(arrayExcel.indexOf(x) == -1)

                return true;
            else
                return false;
        });


        // console.log(array_difference)
        // console.log(array_difference.length)
    })
    .catch(err=>{
        console.log(err)
    })     
}
// checkArchive()

async function kek(){
    //adding to excel 
    delivery_cost = o.delivery_cost != 0 ? o.delivery_cost.replace(" ",''): 0
    console.log(o.order_id+' kaspi delivery cost'+delivery_cost)

    await addCell(o.order_id,'order_id',o.order_id)
    await addCell(o.order_id,'Дата поступления', o.createdDate.getDate()+"."+(o.createdDate.getMonth()+1)+"."+o.createdDate.getFullYear())
    await addCell(o.order_id,'Наименование товара',o.product_name)
    await addCell(o.order_id,'Доставка',delivery_cost)
    await addCell(o.order_id,'Город',o.town)
    await addCell(o.order_id,'Цена продажи',o.total_price.replace(" ",''))
}
