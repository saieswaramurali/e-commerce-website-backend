import Product from "../models/product.model.js";
import User from "../models/user.model.js";


export const createProduct = async (req, res) => {
  try {
    const { name, description, keyPoints, price, offerPrice, stock } = req.body;

    if (!name) {
      return res.status(400).json({ error: "No name is provided" });
    }

    if (!description) {
      return res.status(400).json({ error: "No description is provided" });
    }
    //should include cloudinary at later stage when integrating with the front-end
    if(!keyPoints) {
      return res.status(400).json({error: "No Keypoints is provided"}) ; 
    }

    if (!price) {
      return res.status(400).json({ error: "No price is provided" });
    }

    const product = new Product({
      name,
      description,
      keyPoints, 
      price,
      offerPrice,
      stock,
    });

    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProducts = async (req, res) => {
    
    try {
      const products = await Product.find() ; 

      if(products.length == 0) {
       return res.status(404).json({error: "No Users Exist"}) ; 
      }

      return res.status(200).json(products) ; 

    } catch (error) {
      return res.status(500).json({success: false , error: error.message}) ; 
    }

} ; 

export const getProduct = async (req, res) => {

  try {
    const {id} = req.params ;

    const product = await Product.findById(id) ; 

    if(!product) {
      return res.status(404).json({error: "Product Not Found!"}) ; 
    }

    return res.status(200).json({product}) ; 

  } catch (error) {
    return res.status(500).json({success: false, error: error.message}) ; 
  }

} ; 

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,            
      runValidators: true  
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({ message: "Product updated successfully", product: updatedProduct });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted successfully", deletedProduct });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


//ADD TO CART 


// GET Cart - get the current user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).populate('cart.product');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.status(200).json({ cart: user.cart });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// ADD to Cart - add or increment product quantity in cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.params.userId;

    if (!productId) return res.status(400).json({ message: "Product ID is required." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const existingItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

    if (existingItemIndex !== -1) {
      // Already exists -> increment quantity
      user.cart[existingItemIndex].quantity += quantity || 1;
    } else {
      // New item
      user.cart.push({ product: productId, quantity: quantity || 1 });
    }

    await user.save();

    res.status(200).json({ message: "Added to cart", cart: user.cart });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
};

// UPDATE Cart Item Quantity
export const updateCartItem = async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const item = user.cart.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    item.quantity = quantity;

    await user.save();

    res.status(200).json({
      message: "Cart item updated successfully",
      updatedItem: item,
      cart: user.cart
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Error updating cart", error: error.message });
  }
};


// REMOVE Cart Item
export const removeCartItem = async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const item = user.cart.id(itemId); // Mongoose subdocument by _id
    if (!item) {
      console.warn(`Cart item with ID ${itemId} not found for user ${userId}`);
      return res.status(404).json({ message: "Cart item not found." });
    }

    item.deleteOne(); // or item.remove() depending on Mongoose version

    await user.save();

    res.status(200).json({ message: "Item removed from cart", cart: user.cart });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ message: "Error removing item", error: error.message });
  }
};


export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.cart = [];
    await user.save();

    res.status(200).json({ message: "Cart cleared", cart: user.cart });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Error clearing cart", error: error.message });
  }
};

