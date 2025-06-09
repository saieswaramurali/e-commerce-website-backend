import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      unique: true ,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
    },

    keyPoints : {
      type : [String] , 
      required: true ,
    } , 

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },
    offerPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
  },
  { timestamps: true }
);


const product = mongoose.model("Product", productSchema) ; 

export default product ; 