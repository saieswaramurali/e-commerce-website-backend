import {Router} from 'express' ; 
import {placeOrder, getAllOrders, getOrder, updateOrder, deleteOrder} from '../controllers/order.controller.js' ; 

const ordersRouter = Router() ; 

ordersRouter.post('/place', placeOrder) ; 

ordersRouter.get('/', getAllOrders) ; 

ordersRouter.get('/:userId', getOrder); 

ordersRouter.put('/:id', updateOrder) ; 

ordersRouter.delete('/:id', deleteOrder) ; 

export default ordersRouter ; 