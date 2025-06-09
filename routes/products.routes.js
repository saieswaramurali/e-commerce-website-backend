import {Router} from 'express' ; 
import { getProduct, getProducts, createProduct, updateProduct, deleteProduct, addToCart ,
    getCart, updateCartItem , removeCartItem, clearCart
} from '../controllers/product.controller.js';

const productsRouter = Router() ; 

productsRouter.post("/", createProduct) ; 

productsRouter.get("/", getProducts) ; 

productsRouter.get("/:id", getProduct) ;

productsRouter.put("/:id", updateProduct); 

productsRouter.delete("/:id", deleteProduct) ; 


//CART ROUTERS
productsRouter.get('/cart/:userId', getCart);

// Add to cart
productsRouter.post('/:userId/add-to-cart', addToCart);

// Update quantity of a cart item
productsRouter.patch('/:userId/cart-item/:itemId', updateCartItem);

// Remove cart item
productsRouter.delete('/:userId/cart-item/:itemId', removeCartItem);

productsRouter.delete('/:userId/clear', clearCart);


export default productsRouter ; 