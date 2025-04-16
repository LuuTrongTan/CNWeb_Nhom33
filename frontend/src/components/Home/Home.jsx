import React, { useState, useEffect } from 'react';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import ProductCard from '../Product/ProductCard';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Simulating data fetching from an API
    const fetchProducts = async () => {
      try {
        // This would be an actual API call in a real application
        // const response = await fetch('/api/products/featured');
        // const data = await response.json();
        
        // Simulated data
        const fakeProducts = [
          {
            id: 1,
            name: 'Slim Fit T-shirt',
            price: 249000,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            category: 'T-shirts',
            isNew: true,
            discount: 0
          },
          {
            id: 2,
            name: 'Denim Jacket',
            price: 799000,
            image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            category: 'Jackets',
            isNew: false,
            discount: 15
          },
          {
            id: 3,
            name: 'Casual Pants',
            price: 499000,
            image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            category: 'Pants',
            isNew: true,
            discount: 0
          },
          {
            id: 4,
            name: 'Summer Dress',
            price: 599000,
            image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            category: 'Dresses',
            isNew: false,
            discount: 20
          },
          {
            id: 5,
            name: 'Leather Belt',
            price: 299000,
            image: 'https://images.unsplash.com/photo-1553704571-c32d20af710a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            category: 'Accessories',
            isNew: true,
            discount: 0
          },
          {
            id: 6,
            name: 'Hooded Sweatshirt',
            price: 449000,
            image: 'https://images.unsplash.com/photo-1556172232-e6e33c9d8010?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            category: 'Hoodies',
            isNew: false,
            discount: 10
          },
          {
            id: 7,
            name: 'Classic Shirt',
            price: 399000,
            image: 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            category: 'Shirts',
            isNew: true,
            discount: 0
          },
          {
            id: 8,
            name: 'Knit Sweater',
            price: 549000,
            image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            category: 'Sweaters',
            isNew: false,
            discount: 5
          }
        ];

        setProducts(fakeProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="home-container">
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="home-content">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="main-content">
          <section className="hero-section">
            <div className="hero-content">
              <h1>New Season Arrivals</h1>
              <p>Discover the latest trends in fashion</p>
              <button className="shop-now-btn">Shop Now</button>
            </div>
          </section>

          <section className="featured-products">
            <div className="section-header">
              <h2>Featured Products</h2>
              <a href="/products" className="view-all">View All</a>
            </div>

            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>

          <section className="categories-section">
            <div className="section-header">
              <h2>Shop by Category</h2>
            </div>
            <div className="categories-grid">
              <div className="category-card">
                <img src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Men's Clothing" />
                <h3>Men's Clothing</h3>
              </div>
              <div className="category-card">
                <img src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Women's Clothing" />
                <h3>Women's Clothing</h3>
              </div>
              <div className="category-card">
                <img src="https://images.unsplash.com/photo-1519256155806-cd510524ed97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Accessories" />
                <h3>Accessories</h3>
              </div>
              <div className="category-card">
                <img src="https://images.unsplash.com/photo-1511556532299-8f662fc26c06?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Footwear" />
                <h3>Footwear</h3>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Home; 