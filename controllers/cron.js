const CronJob = require("cron").CronJob;
const {checkNewOrders} = require('./checkNewOrders')
const {checkSignRequired} = require('./checkSignRequired')
const {checkPickup} = require('./checkPickup')
const {checkDelivery} = require('./checkDelivery')
const {checkKaspiDelivery} = require('./checkKaspiDelivery')
const {checkCancelled} = require('./checkCancelled')
const {checkCompleted} = require('./checkCompleted')
const {checkReturned} = require('./checkReturned')

const ORDER = require("../models/order");

// крон на проверку статусов заказов
new CronJob("*/1 * * * *", async () => {
    console.log('You will see this message every minute')
    checkNewOrders()
    checkSignRequired()
    checkPickup()
    checkDelivery()
    checkKaspiDelivery()
    checkCancelled()
    checkCompleted()
    checkReturned()
}).start();

async function kek(){
  let orders = await ORDER.find({});
  if(orders){
      // console.log(user,25)
      console.log('всего заказов: '+orders.length)
  }
}  
kek()
