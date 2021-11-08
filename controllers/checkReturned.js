const axios = require('axios')
const { bot } = require("../telegram/index");
const extra = require('telegraf/extra')
const markup = extra.HTML()

//database models
const BotUser = require("../models/botUser");
const ORDER = require("../models/order");

const {addCell} = require('../google_services/actions')
const date = '1610338081000'

async function checkReturned(){
    const users = await BotUser.find({})

    const headers = {
        'Content-Type': 'application/json',
        'X-Auth-Token':'xAVpheE7v6RFLHShixjAfjTlTG+jvTUk9ZvR65mWxow='
    }

    console.log('checking Returned orders')
    axios.get('https://kaspi.kz/shop/api/v2/orders?page[number]=0&page[size]=1000'+
    '&filter[orders][state]=KASPI_DELIVERY'+
    '&filter[orders][status]=CANCELLING'+
    '&filter[orders][creationDate][$ge]='+date, {
        headers: headers
    })
    .then(async response=>{
        const data = await response.data.data
        if(data.length!==0){
            data.forEach(async order=>{
                let o = await ORDER.findOne({order_id:order.attributes.code});
                if(o){
                    if(o.step !=='RETURN' || o.step ==='COMPLETED'){
                        const filter = { order_id: o.order_id};
                        const update = {
                            state:order.attributes.state,
                            status:order.attributes.status,
                            step:'RETURN'
                        }
                        await ORDER.updateOne(filter, update, {
                            new: true,
                        });
                        console.log('Возврат❗️❗️❗️')
                        
                       
                        users.forEach((user)=>{
                            bot.telegram.sendMessage(user.chat_id,
                                '🟠 <b>ВОЗВРАТ</b>'+'\
                                \n<b>Товар: </b> <i> '+o.product_name+'</i>\
                                \n<b>ID заказа: </b> <i>'+o.order_id+'</i>\
                                \n<b>Имя: </b> <i>'+o.cust_fname+' '+o.cust_lname+'</i>\
                                \n<b>Адрес: </b> <i>'+o.address+'</i>\
                                \n<b>Телефон: </b> <i> +7'+o.cust_phone+'</i>\
                                \n<b>Стоимость: </b> <i> '+o.total_price+' тг.</i>\
                                \n<b>Ссылка: </b> <i> '+o.url+'</i>'
                                ,
                            markup)
                        }) 
                        console.log(o.order_id+' order udated (RETURN)')

                        //change excel
                        addCell(o.order_id,'Дата выдачи','ВОЗВРАТ')
                        
                    }                  
                }
            }) 
        }  
    })
    .catch(err=>{
        console.log(err)
    })     
}

checkReturned()

module.exports = {
    checkReturned
};

