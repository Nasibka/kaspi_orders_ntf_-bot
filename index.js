require("./db")();
require("./controllers/cron");
const ORDER = require("./models/order");

async function kek(){
    // await ORDER.deleteOne({order_id:149137587}, function (err) {
    //     if(err)  return console.log(err);
    //     console.log('deleted')
    // });
    // await ORDER.deleteMany(function (err) {
    //     if(err)  return console.log(err);
    //     console.log('deleted')
    // });
}
kek()
