import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService, cartService, wishlistService } from '@/services/api';
import { Heart, ShoppingBag, Star, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  tags?: string[];
  imageUrl?: string;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showAddToCartToast, setShowAddToCartToast] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
      checkWishlist(parseInt(id));
    }
  }, [id]);

  const fetchProduct = async (productId: number) => {
    try {
      setLoading(true);
      const response = await productService.getProductById(productId);
      setProduct(response);
      setError(null);
    } catch (err) {
      setError('获取商品详情失败');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = (productId: number) => {
    setIsInWishlist(wishlistService.isInWishlist(productId));
  };

  const toggleWishlist = () => {
    if (product) {
      if (isInWishlist) {
        wishlistService.removeFromWishlist(product.id);
        setIsInWishlist(false);
      } else {
        wishlistService.addToWishlist(product);
        setIsInWishlist(true);
      }
    }
  };

  const addToCart = () => {
    if (product) {
      cartService.addItem(product, 1);
      setShowAddToCartToast(true);
      setTimeout(() => setShowAddToCartToast(false), 3000);
    }
  };

  const handleCreateOrder = () => {
    if (product) {
      navigate('/orders/create', {
        state: {
          productId: product.id,
          amount: product.price,
          name: product.name
        }
      });
    }
  };

  const categoriesMap: Record<string, string> = {
    food: '宠物食品',
    toys: '玩具用品',
    accessories: '配件装备',
    healthcare: '医疗保健',
    services: '服务项目',
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e9ecef',
            borderLeftColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#666', marginTop: '1rem' }}>加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <AlertCircle size={64} color="#ff6b6b" style={{ marginBottom: '1rem' }} />
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>商品不存在</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          {error || '商品可能已被删除或不存在'}
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
            fontSize: '1rem'
          }}
        >
          返回商品列表
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Breadcrumb */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '2rem',
        fontSize: '0.9rem'
      }}>
        <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>首页</Link>
        <span style={{ color: '#999' }}>/</span>
        <Link to="/products" style={{ color: '#666', textDecoration: 'none' }}>商品</Link>
        <span style={{ color: '#999' }}>/</span>
        <span style={{ color: '#667eea' }}>{product.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        {/* Product Image */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
        }}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{
                width: '100%',
                borderRadius: '12px',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '400px',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingBag size={64} color="rgba(255,255,255,0.5)" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.4rem 1rem',
              background: 'rgba(102, 126, 234, 0.1)',
              color: '#667eea',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              {categoriesMap[product.category] || product.category}
            </span>
            <h1 style={{
              margin: 0,
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#333',
              lineHeight: '1.3'
            }}>
              {product.name}
            </h1>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            marginBottom: '2rem',
            padding: '1.5rem 0',
            borderBottom: '2px solid #f0f0f0'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#667eea'
            }}>
              ¥{product.price.toFixed(2)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffa500' }}>
              <Star size={20} fill="#ffa500" />
              <span style={{ color: '#666' }}>4.8</span>
            </div>
          </div>

          {product.description && (
            <div style={{
              marginBottom: '2.5rem',
              lineHeight: '1.8',
              color: '#666',
              fontSize: '1.1rem'
            }}>
              {product.description}
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div style={{
              marginBottom: '2.5rem',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.75rem' }}>
                标签：
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '0.4rem 1rem',
                      background: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      color: '#666'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={addToCart}
              style={{
                flex: 1,
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s ease'
              }}
            >
              <ShoppingBag size={20} />
              加入购物车
            </button>
            <button
              onClick={toggleWishlist}
              style={{
                padding: '1rem',
                background: isInWishlist ? '#ffebee' : 'white',
                border: isInWishlist ? '2px solid #e91e63' : '2px solid #e0e0e0',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px'
              }}
            >
              <Heart
                size={24}
                color={isInWishlist ? '#e91e63' : '#999'}
                fill={isInWishlist ? '#e91e63' : 'none'}
              />
            </button>
            <button
              onClick={handleCreateOrder}
              style={{
                padding: '1rem',
                background: 'white',
                border: '2px solid #667eea',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px'
              }}
            >
              <CheckCircle size={24} color="#667eea" />
            </button>
          </div>

          <p style={{
            textAlign: 'center',
            color: '#999',
            fontSize: '0.85rem',
            marginTop: '1.5rem'
          }}>
            ⚡ 快速配送 | 💯 品质保证 | 🎁 满额包邮
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {showAddToCartToast && (
        <div style={{
          position: 'fixed',
          bottom: '3rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(46, 125, 50, 0.9)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          animation: 'fadeInUp 0.3s ease'
        }}>
          <CheckCircle size={20} />
          <span>已添加到购物车</span>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
