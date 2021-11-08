const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
{
    order_id: {
      type: String,
      required: true,
    },
    product_name:{
      type: String,
      default:''
    },
    total_price:{
      type: String,
      default:''
    },
    cust_fname: {
      type: String,
      default:''
    },
    cust_lname: {
        type: String,
        default:''
      },
    address: {
      type: String,
      default:''
    },
    cust_phone: {
      type: String,
      default:''
    },
    state:{
      type: String, 
      default:''
    },
    status:{
      type: String, 
      default:''
    },
    createdDate: {
      type: Date,
      default: ''
    },
    step: {
      type: String,
      default: 'new',
    },
    town: {
      type: String,
      default: '',
    },
    delivery_cost: {
      type: String,
      default: '',
    },
    url:{
      type: String,
      default: '',
    },
    quantity:{
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("order", OrderSchema);
