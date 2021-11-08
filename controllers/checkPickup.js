const axios = require('axios')
const { bot } = require("../telegram/index");
const extra = require('telegraf/extra')
const markup = extra.HTML()

//database models
const BotUser = require("../models/botUser");
const ORDER = require("../models/order");

const {addCell} = require('../google_services/actions')
const {subtrQuantity} = require('../google_services/warehouse_acts')

const date = '1610338081000'
async function checkPickup(){
    const users = await BotUser.find({})

    const headers = {
        'Content-Type': 'application/json',
        'X-Auth-Token':'xAVpheE7v6RFLHShixjAfjTlTG+jvTUk9ZvR65mWxow='
    }

    console.log('checking PICKUP orders')
    axios.get('https://kaspi.kz/shop/api/v2/orders?page[number]=0&page[size]=1000&filter[orders][state]=PICKUP&filter[orders][creationDate][$ge]='+date, {
        headers: headers
    })
    .then(async response=>{
        const data = await response.data.data
        if(data.length!==0){
            data.forEach(async order=>{
                let o = await ORDER.findOne({order_id:order.attributes.code});
                if(o){
                    if(o.step ==='new'||o.step ==='SIGN_REQUIRED'){
                        const filter = { order_id: o.order_id};
                        const update = {
                            state:order.attributes.state,
                            status:order.attributes.status,
                            step:'PICKUP'
                        }
                        await ORDER.updateOne(filter, update, {
                            new: true,
                        });
                        console.log(o.order_id+' order udated (PICKUP)')
                    
                        users.forEach((user)=>{
                            bot.telegram.sendMessage(user.chat_id,
                                '🟡 <b>СТАТУС ЗАКАЗА ОБНОВЛЕН</b>'+'\
                                \n<b>Товар: </b> <i>'+o.product_name+'</i>\
                                \n<b>ID заказа: </b> <i>'+o.order_id+'</i>\
                                \n<b>Имя: </b> <i>'+o.cust_fname+' '+o.cust_lname+'</i>\
                                \n<b>Адрес: </b> <i>'+o.address+'</i>\
                                \n<b>Телефон: </b> <i> +7'+o.cust_phone+'</i>\
                                \n<b>Стоимость: </b> <i> '+o.total_price+' тг.</i>\
                                \n<b>Ссылка: </b> <i> '+o.url+'</i>\
                                \n<b>Статус: </b> <i> Самовывоз </i>' 
                                ,
                            markup)
                        })  
                        //adding to excel 
                        await addCell(o.order_id,'order_id',o.order_id)
                        await addCell(o.order_id,'Дата поступления', o.createdDate.getDate()+"."+(o.createdDate.getMonth()+1)+"."+o.createdDate.getFullYear())
                        await addCell(o.order_id,'Наименование товара',o.product_name)
                        await addCell(o.order_id,'Город','Самовывоз') 
                        await addCell(o.order_id,'Цена продажи',o.total_price.replace(" ",''))  
                        
                        //excel with warehouse
                        const q = o.quantity? o.quantity : 1
                        await subtrQuantity(o.product_name,q)
                    }            
                }
            }) 
        }  
    })
    .catch(err=>{
        console.log(err)
    })     
}


module.exports = {
    checkPickup
};