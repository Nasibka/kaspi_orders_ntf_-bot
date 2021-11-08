const {doc} = require('./index')


async function kek(){
    await addCell('test','order_id','test')
    await addCell('test','Наименование товара','MATPOL Пихта 180 см')
    await addCell('test','Цена продажи','23998')
}
// kek()

async function addCell(order_id, column_name, value){
    await doc.loadInfo();
    const sheet = doc.sheetsById[127077982]
    const rows = await sheet.getRows()

    let lastRowIndex
    rows.forEach((r,index) => {
        if(r.order_id!==''){
            lastRowIndex = index
        }
    })

    //find this order if it exist in excel
    var row, index = rows.length - 1;
    let rowIndex
    for ( ; index >= 0; index--) {
        if (rows[index].order_id == order_id) {
            row = rows[index];
            rowIndex = index
            break;
        }
    }

    if(row){
        row[column_name] = value
        await row.save()
        console.log('udating row: '+ (rowIndex+2))
        if(column_name==='Цена продажи'){
            row['Себестоимость']="=ЕСЛИ(ЕПУСТО(E"+(rowIndex+2)+")=ЛОЖЬ();UNIQUE(FILTER('Себестоимость товаров'!$J$2:$J;'Себестоимость товаров'!$C$2:$C=E"+(rowIndex+2)+"));\"\")"
            row['Итого себестоимость']="=СУММ(F"+(rowIndex+2)+":J"+(rowIndex+2)+")"
            row['Ожидаемая прибыль']="=L"+(rowIndex+2)+"-K"+(rowIndex+2)+""
            row['Банк']="=(L"+(rowIndex+2)+"-I"+(rowIndex+2)+")*10/100"
            row['Снятие 1%']="=L"+(rowIndex+2)+"/100*1"
            await row.save()
        }if(column_name==='Прибыль'){
            const today = new Date()
            row['Прибыль'] = "=L"+(rowIndex+2)+"-K"+(rowIndex+2)+""
            row['Ожидаемая прибыль'] = '0'
            row['Дата выдачи'] = today.getDate()+"."+(today.getMonth()+1)+"."+today.getFullYear()
            row['Продано'] = 'Да'

            row['Себестоимость']="=ЕСЛИ(ЕПУСТО(E"+(rowIndex+2)+")=ЛОЖЬ();UNIQUE(FILTER('Себестоимость товаров'!$J$2:$J;'Себестоимость товаров'!$C$2:$C=E"+(rowIndex+2)+"));\"\")"
            row['Итого себестоимость']="=СУММ(F"+(rowIndex+2)+":J"+(rowIndex+2)+")"
            row['Банк']="=(L"+(rowIndex+2)+"-I"+(rowIndex+2)+")*10/100"
            row['Снятие 1%']="=L"+(rowIndex+2)+"/100*1"
            await row.save()
        }
        if(column_name==='Площадка продажи'){
            row['Себестоимость']="0"
            row['Итого себестоимость']="0"
            row['Ожидаемая прибыль']="0"
            row['Банк']="0"
            row['Цена продажи']="0"
            row['Снятие 1%']="0"
            row['Доставка']="0"
            row['Курьер']="0"
            await row.save()
        }
    }
    else{
        if(column_name==='order_id'){
            console.log((lastRowIndex+3)+' cell order_id added')
            await sheet.addRow({ order_id:value})
        }
        
        // console.log(rows[lastRowIndex+1])
        // rows[lastRowIndex+1][column_name] = value
        // await rows[lastRowIndex+1].save()
    } 
}

// addCell('test1','order_id','test1')
// addCell('test1','Дата поступления', '12.02.2025')
// addCell('test1','Наименование товара','DOMINO Home&Horeca N-06 6 предметов')
// addCell('test1','Цена продажи','18978')  
// addCell('test1','Продано','Да')  
// addCell('test1','Прибыль','') 

module.exports = {
    addCell
};