import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Plus, Search, Filter, Star, Heart, Tags, ChevronRight, X, SlidersHorizontal } from 'lucide-react'
import { productService, cartService, wishlistService } from '../services/api'
import { Product, WishlistItem } from '../types'

const categories = [
  { id: 'all', name: '全部商品', icon: '📦' },
  { id: 'food', name: '宠物食品', icon: '🍖' },
  { id: 'toys', name: '玩具用品', icon: '⚽' },
  { id: 'accessories', name: '配件装备', icon: '🦴' },
  { id: 'healthcare', name: '医疗保健', icon: '🏥' }
]

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCategoryFilter, setShowCategoryFilter] = useState(false)
  const navigate = useNavigate()

  // 刷新购物车状态
  const [cartVersion, setCartVersion] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setCartVersion(v => v + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await productService.getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  // 综合过滤逻辑
  const filteredProducts = useMemo(() => {
    let result = products

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // 分类过滤
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory)
    }

    return result
  }, [products, searchQuery, selectedCategory])

  const handleProductClick = (id: number) => {
    navigate(`/products/${id}`)
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const toggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    if (wishlistService.isInWishlist(product.id)) {
      wishlistService.removeFromWishlist(product.id)
    } else {
      wishlistService.addToWishlist(product)
    }
  }

  return (
    <div className="product-list-page">
      <div className="product-list-header">
        <h2>商品列表</h2>

        {/* 搜索栏 */}
        <div className="search-filter">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="搜索商品名称、描述或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={clearSearch}>
                <X size={16} />
              </button>
            )}
          </div>

          <button
            className="filter-toggle-btn"
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
          >
            <SlidersHorizontal size={18} />
            <span>筛选</span>
          </button>
        </div>

        {/* 分类筛选下拉 */}
        {showCategoryFilter && (
          <div className="category-filter-dropdown">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat.id)
                  setShowCategoryFilter(false)
                }}
              >
                <span className="category-icon">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 结果统计 */}
      {!loading && (
        <div className="results-count">
          <span>找到 {filteredProducts.length} 个商品</span>
          {(searchQuery || selectedCategory !== 'all') && (
            <button className="clear-filters-btn" onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}>
              <X size={14} /> 清除筛选
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>加载中...</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => handleProductClick(product.id)}
            >
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="product-image" />
              ) : (
                <div className="product-image-placeholder">
                  <ShoppingCart className="placeholder-icon" />
                </div>
              )}
              <div className="product-info">
                <div className="product-name">{product.name}</div>
                <div className="product-description">{product.description}</div>
                <div className="product-tags">
                  {product.tags?.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="product-price">
                  ¥{product.price.toFixed(2)}
                  <button
                    className="add-to-cart-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      cartService.addItem(product, 1)
                      alert(`已添加 ${product.name} 到购物车`)
                    }}
                  >
                    <Plus className="icon" />
                  </button>
                  <button
                    className="wishlist-btn"
                    onClick={(e) => toggleWishlist(e, product)}
                    title={wishlistService.isInWishlist(product.id) ? '取消收藏' : '收藏'}
                  >
                    <Heart className={`heart-icon ${wishlistService.isInWishlist(product.id) ? 'filled' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="no-results">
          <Filter className="no-results-icon" />
          <p>没有找到商品</p>
          <button onClick={() => {
            setSearchQuery('')
            setSelectedCategory('all')
          }}>
            查看所有商品
          </button>
        </div>
      )}
    </div>
  )
}
