import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingBag, AlertCircle } from 'lucide-react';
import { cartService } from '../services/api';

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [version, setVersion] = useState(0);
  const navigate = useNavigate();

  interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }

  useEffect(() => {
    setCartItems(cartService.getCartItems());
  }, [version]);

  const updateQuantity = (id: number, quantity: number) => {
    cartService.updateQuantity(id, quantity);
    setVersion(v => v + 1);
  };

  const removeItem = (id: number) => {
    if (window.confirm('确定要删除此商品吗？')) {
      cartService.removeItem(id);
      setVersion(v => v + 1);
    }
  };

  const getTotalPrice = () => {
    return cartService.getTotal();
  };

  const getTotalCount = () => {
    return cartService.getCount();
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('购物车为空');
      return;
    }
    navigate('/orders/create', {
      state: { items: cartItems, totalAmount: getTotalPrice() }
    });
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '0.6rem',
              background: '#f0f0f0',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} color="#666" />
          </button>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#333' }}>购物车</h1>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <ShoppingBag size={80} style={{ color: '#e9ecef', marginBottom: '1.5rem' }} />
          <h2 style={{ color: '#333', marginBottom: '0.5rem' }}>你的购物车是空的</h2>
          <p style={{ color: '#666', maxWidth: '400px', textAlign: 'center', marginBottom: '2rem' }}>
            浏览商品并添加到购物车，方便一次性结算
          </p>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '0.85rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            去浏览商品
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => navigate('/products')}
          style={{
            padding: '0.6rem',
            background: '#f0f0f0',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
        >
          <ArrowLeft size={20} color="#666" />
        </button>
        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#333' }}>
          购物车
          <span style={{
            marginLeft: '1rem',
            padding: '0.25rem 0.75rem',
            background: '#667eea',
            color: 'white',
            borderRadius: '20px',
            fontSize: '0.9rem'
          }}>
            {getTotalCount()} 件商品
          </span>
        </h1>
      </div>

      {/* Cart Items */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        {cartItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1.5rem',
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  marginRight: '1.5rem'
                }}
              />
            ) : (
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                borderRadius: '8px',
                marginRight: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShoppingBag size={32} color="rgba(255,255,255,0.5)" />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.1rem',
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                {item.name}
              </h3>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                单价：<span style={{ color: '#667eea', fontWeight: 'bold' }}>¥{item.price.toFixed(2)}</span>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#f0f0f0',
                borderRadius: '8px',
                padding: '0.25rem'
              }}>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: 'none',
                    background: 'white',
                    borderRadius: '6px',
                    cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#667eea',
                    fontWeight: 'bold',
                    fontSize: '1.2rem'
                  }}
                >
                  -
                </button>
                <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '500' }}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: 'none',
                    background: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#667eea',
                    fontWeight: 'bold',
                    fontSize: '1.2rem'
                  }}
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                style={{
                  width: '40px',
                  height: '40px',
                  border: 'none',
                  background: '#fee2e2',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
                title="删除商品"
              >
                <Trash2 size={18} color="#e91e63" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '2rem',
        padding: '2rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
            应付金额
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#667eea' }}>
            ¥{getTotalPrice().toFixed(2)}
          </div>
        </div>
        <button
          onClick={handleCheckout}
          style={{
            padding: '1rem 3rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          去结算
        </button>
      </div>
    </div>
  );
}
