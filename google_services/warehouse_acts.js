const {doc} = require('./index')


async function kek(){
    const name = 'Fissman Emily 2.6 л'
    addQuantity(name,16)
}
// kek()
async function findRow(name){
    console.log('warehouse 10: '+name);
    await doc.loadInfo();
    const sheet = doc.sheetsById[1124417481]
    const rows = await sheet.getRows()

    let rowIndex
    let quantity = 0
    var index = rows.length - 1;
    for ( ; index >= 0; index--) {
        if (rows[index]['наименование'] == name) {
            quantity = rows[index]['кол-во']
            rowIndex = index
            break;
        }
    }

    const result = rowIndex ? rowIndex : false
    return [result,quantity]
}

async function updateCell(index , quantity){
    await doc.loadInfo();
    const sheet = doc.sheetsById[1124417481]
    const rows = await sheet.getRows()
    const gs_index = index+2

    const row = rows[index] 
    row['кол-во'] = quantity
    row['номер'] = index+1
    await row.save()
    row['сумма'] = '=C'+gs_index+'*D'+gs_index
    await row.save()
}

async function addCell(name, quantity){
    await doc.loadInfo();
    const sheet = doc.sheetsById[1124417481]
    const prices_sheet = doc.sheetsById[1825765023]
    const rows = await prices_sheet.getRows()
    var index = rows.length - 1;

    let price = ''
    for ( ; index >= 0; index--) {
        if (rows[index]['Наименование товара'] == name) {
            price = rows[index]['Себестоимость']
            break;
        }
    }  
    
    await sheet.addRow(['id',name,quantity,price]);
    const ind = await findRow(name)
    console.log('Row: '+(parseInt(ind[0])+1))
    await updateCell(ind[0],quantity)

}

async function addQuantity(name,q){
    const res = await findRow(name)
    const index = res[0]
    const quantity = res[1]

    const plus = parseInt(quantity)+q
    if(index!=false){  
        updateCell(index,plus)
        console.log('updated cell in add')
        console.log('Row: '+(parseInt(index)+1))
    }else{
        addCell(name,q)
        console.log('added new row in add')
    }
}

async function subtrQuantity(name,q){
    const res = await findRow(name)
    const index = res[0]
    const quantity = res[1]
    console.log('warehouse 86:'+index+' '+quantity)

    const plus = parseInt(quantity)-q
    if(index!=false){
        updateCell(index,plus)
        console.log('updated cell in subtr')
        console.log('Row: '+(parseInt(index)+1))
    }else{
        addCell(name,-q)
        console.log('added new row in subtr')
    }
}

module.exports = {
    addCell,
    addQuantity,
    subtrQuantity
};