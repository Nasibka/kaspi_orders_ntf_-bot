const axios = require('axios')
const { bot } = require("../telegram/index");
const extra = require('telegraf/extra')
const markup = extra.HTML()

// const {addCell} = require('../google_services/actions')

//database models
const BotUser = require("../models/botUser");
const ORDER = require("../models/order");

const formatter = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
  });
const date = '1610338081000'

async function checkNewOrders(){
    const users = await BotUser.find({})

    const headers = {
        'Content-Type': 'application/json',
        'X-Auth-Token':'xAVpheE7v6RFLHShixjAfjTlTG+jvTUk9ZvR65mWxow='
    }

    console.log('checking NEW orders')
    let today = new Date();
    axios.get('https://kaspi.kz/shop/api/v2/orders?page[number]=0&page[size]=20&filter[orders][state]=NEW&filter[orders][creationDate][$ge]='+date, {
        headers: headers
    })
    .then(async response=>{
        const data = await response.data.data
        if(data.length!==0){
            data.forEach(async order=>{
                let o = await ORDER.findOne({order_id:order.attributes.code});
                // console.log(o,32)
                if(!o){
                    console.log('THERE IS NEW ORDER')
                    axios.get(order.relationships.entries.links.self, {
                        headers: headers
                    })
                    .then(async response=>{
                
                        let quantity
                        await axios.get('https://kaspi.kz/shop/api/v2/orders/'+order.id+'/entries', {
                            headers: headers
                        })
                        .then(async res=>{
                            quantity = res.data.data[0].attributes.quantity
                            console.log("Quantity of "+order.attributes.code+ ': '+quantity)

                        })
                        axios.get('https://kaspi.kz/shop/api/v2/orderentries/'+response.data.data[0].id+'/product', {
                            headers: headers
                        })
                        .then(async response=>{
                            console.log(today)
                            console.log(order.attributes.code)
                            let delivery_address
                            let town
                            if(order.attributes.deliveryAddress){
                                delivery_address = order.attributes.deliveryAddress.formattedAddress
                                town = order.attributes.deliveryAddress.town
                            }else{
                                delivery_address=''
                                town = ''
                            }
                            // const delivery_address= order.attributes.deliveryAddress.formattedAddress ? order.attributes.deliveryAddress.formattedAddress: ''
                            // console.log(delivery_address)
                            const newOrder = {
                                order_id:order.attributes.code,
                                state:order.attributes.state,
                                status:order.attributes.status,
                                cust_fname:order.attributes.customer.firstName,
                                cust_lname:order.attributes.customer.lastName,
                                cust_phone:order.attributes.customer.cellPhone,
                                address:delivery_address,
                                quantity:quantity,
                                createdDate:new Date(order.attributes.creationDate),
                                url:'https://kaspi.kz/merchantcabinet/#/orders/details/'+order.attributes.code,
                                total_price:formatter.format(order.attributes.totalPrice,100000).replace(/,/g, " "),
                                product_name:response.data.data.attributes.name,
                                delivery_cost:formatter.format(order.attributes.deliveryCost,100000).replace(/,/g, " "),
                                town: town

                            }
                            console.log(newOrder)
    
                            //saving to database
                            let orderM = new ORDER(newOrder)
            
                            orderM.save(async (err, saved) => {
                            if(err) console.log(err, ' ,error in saving new order');
                                if (saved) {
                                    console.log('order saved')
                                };
                            });
                
                            //sending ntf to bot
                            users.forEach((user)=>{
                                bot.telegram.sendMessage(user.chat_id,
                                    '🟢 <b>НОВЫЙ ЗАКАЗ</b>'+'\
                                    \n<b>Товар: </b> <i>'+newOrder.product_name+'</i>\
                                    \n<b>ID заказа: </b> <i>'+newOrder.order_id+'</i>\
                                    \n<b>Имя: </b> <i>'+newOrder.cust_fname+' '+newOrder.cust_lname+'</i>\
                                    \n<b>Адрес: </b> <i>'+newOrder.address+'</i>\
                                    \n<b>Телефон: </b> <i> +7'+newOrder.cust_phone+'</i>\
                                    \n<b>Стоимость: </b> <i>'+newOrder.total_price+' тг.</i>\
                                    \n<b>Ссылка: </b> <i> '+newOrder.url+'</i>'
                                    ,
                                markup)
                            })

                            
                        })
                        .catch(err=>{
                            console.log(err)
                        })  
                    })
                    .catch(err=>{
                        console.log(err)
                    })  
                   
                }
            }) 
        }  
    })
    .catch(err=>{
        console.log(err)
    })     
}

module.exports = {
    checkNewOrders
};