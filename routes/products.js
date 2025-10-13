// routes/products.js
const express = require('express');
const router = express.Router();

// GET /api/products - Get all products
router.get('/', (req, res) => {
  const products = [
    {
      id: '1',
      name: "Wireless Bluetooth Headphones",
      price: 89.99,
      originalPrice: 129.99,
      description: "Noise-cancelling wireless headphones with 30-hour battery life",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
      category: "Electronics",
      featured: true,
      rating: 4.5,
      reviews: 128,
      inStock: true
    },
    {
      id: '2',
      name: "Smart Watch Series 5",
      price: 249.99,
      originalPrice: 299.99,
      description: "Advanced fitness tracker with heart rate monitor and GPS",
      image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=500&auto=format&fit=crop&q=60",
      category: "Electronics",
      featured: true,
      rating: 4.3,
      reviews: 89,
      inStock: true
    }
  ];

  res.json({
    success: true,
    products: products
  });
});

// GET /api/products/top - Get featured products
router.get('/top', (req, res) => {
  const featuredProducts = [
    {
      id: '1',
      name: "Wireless Bluetooth Headphones",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
      category: "Electronics",
      rating: 4.5
    },
    {
      id: '2', 
      name: "Smart Watch Series 5",
      price: 249.99,
      image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=500&auto=format&fit=crop&q=60",
      category: "Electronics",
      rating: 4.3
    }
  ];

  res.json({
    success: true,
    products: featuredProducts
  });
});

// GET /api/products/:id - Get single product
router.get('/:id', (req, res) => {
  const product = {
    id: req.params.id,
    name: "Sample Product",
    price: 99.99,
    description: "This is a sample product description",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
    category: "Electronics",
    rating: 4.0,
    reviews: 50,
    inStock: true
  };

  res.json({
    success: true,
    product: product
  });
});

module.exports = router;