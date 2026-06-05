import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

const ShoppingCartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load cart items from localStorage or API
    const savedCart = localStorage.getItem('shopping_cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('shopping_cart', JSON.stringify(updatedItems));
  };

  const removeItem = (id: number) => {
    const updatedItems = cartItems.filter(item => item.id !== id);
    setCartItems(updatedItems);
    localStorage.setItem('shopping_cart', JSON.stringify(updatedItems));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      navigate('/orders/create');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>加载中...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>购物车</h1>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <p>您的购物车是空的</p>
          <Link to="/products" className="btn">去购物</Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}>
                <div style={{ flex: 1 }}>
                  <h3>{item.name}</h3>
                  <p style={{ color: '#e91e63', fontWeight: 'bold' }}>¥{item.price}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="btn"
                    style={{ width: '30px', height: '30px', padding: '0' }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="btn"
                    style={{ width: '30px', height: '30px', padding: '0' }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="btn"
                  style={{ background: '#f44336', color: 'white' }}
                >
                  删除
                </button>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#f5f5f5',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2>总计: ¥{getTotalPrice().toFixed(2)}</h2>
            <button className="btn" onClick={handleCheckout}>
              去结算
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingCartPage;