import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, X, Trash2 } from 'lucide-react';
import { wishlistService } from '@/services/api';
import { WishlistItem, Product } from '@/types';

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const items = wishlistService.getWishlistItems();
      setWishlistItems(items);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (id: number) => {
    wishlistService.removeFromWishlist(id);
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  const clearWishlist = () => {
    if (window.confirm('确定要清空所有收藏吗？')) {
      wishlistService.clearWishlist();
      setWishlistItems([]);
    }
  };

  const addToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    // TODO: Use cartService when it's properly exported
    // cartService.addItem(product, 1);
    alert(`加入购物车: ${product.name}`);
  };

  const categoriesMap: Record<string, string> = {
    food: '宠物食品',
    toys: '玩具用品',
    accessories: '配件装备',
    healthcare: '医疗保健',
    services: '服务项目',
  };

  // 过滤逻辑
  const filteredItems = useMemo(() => {
    let result = wishlistItems;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [wishlistItems, searchQuery]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#333' }}>
            我的收藏
          </h1>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            收藏您喜欢的商品，随时查看
          </p>
        </div>
        {wishlistItems.length > 0 && (
          <button
            onClick={clearWishlist}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.2rem',
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            <Trash2 size={16} />
            清空收藏
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div style={{
        background: 'white',
        padding: '1rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          position: 'relative',
          maxWidth: '500px'
        }}>
          <Search style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#999'
          }} size={20} />
          <input
            type="text"
            placeholder="搜索收藏的商品..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.85rem 1rem 0.85rem 3rem',
              border: '2px solid #e9ecef',
              borderRadius: '10px',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#999'
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          color: '#666'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e9ecef',
            borderLeftColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
          }} />
          <p>加载中...</p>
        </div>
      ) : filteredItems.length === 0 ? (
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
          <Heart size={80} style={{ color: '#e9ecef', marginBottom: '1.5rem' }} />
          <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>
            你的收藏夹是空的
          </h3>
          <p style={{ color: '#666', maxWidth: '400px', textAlign: 'center', marginBottom: '2rem' }}>
            浏览商品时点击心形图标即可收藏，方便随时查看
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
      ) : (
        <>
          <div style={{
            marginBottom: '1.5rem',
            color: '#666',
            fontSize: '0.95rem'
          }}>
            找到 <strong>{filteredItems.length}</strong> 个收藏
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredItems.map((product) => (
              <div
                key={product.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div style={{
                  position: 'relative',
                  height: '200px',
                  overflow: 'hidden'
                }}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Heart size={48} style={{ color: 'rgba(255,255,255,0.5)' }} />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(product.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      width: '32px',
                      height: '32px',
                      background: 'rgba(255,255,255,0.9)',
                      borderRadius: '50%',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                    title="取消收藏"
                  >
                    <X size={18} style={{ color: '#e91e63' }} />
                  </button>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '0.5rem',
                    fontSize: '1.1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {product.name}
                  </div>
                  {product.description && (
                    <div style={{
                      color: '#666',
                      fontSize: '0.9rem',
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.description}
                    </div>
                  )}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    {product.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: '0.25rem 0.6rem',
                          background: '#f0f0f0',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          color: '#666'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#667eea'
                    }}>
                      ¥{product.price.toFixed(2)}
                    </div>
                    <button
                      onClick={(e) => addToCart(e, product)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      加入购物车
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WishlistPage;
