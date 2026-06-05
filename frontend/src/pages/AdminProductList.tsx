import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductForm, Product, ProductCategory } from '@/types';
import { productService } from '@/services/api';

const AdminProductList: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categories: { id: string; name: string; value: ProductCategory }[] = [
    { id: 'all', name: '全部分类', value: 'food' },
    { id: 'food', name: '宠物食品', value: 'food' },
    { id: 'toys', name: '玩具用品', value: 'toys' },
    { id: 'accessories', name: '配件装备', value: 'accessories' },
    { id: 'healthcare', name: '医疗保健', value: 'healthcare' },
    { id: 'services', name: '服务项目', value: 'services' },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除此商品吗？')) {
      try {
        // TODO: Implement delete API call
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        alert('删除失败');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSave = async (formData: ProductForm) => {
    try {
      if (editingProduct) {
        // Update existing product
        const updated = await productService.updateProduct?.(editingProduct.id, formData);
        if (updated) {
          setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...updated } : p));
        }
      } else {
        // Create new product
        const newProduct = await productService.createProduct(formData);
        setProducts([...products, newProduct]);
      }
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      alert('保存失败');
    }
  };

  const categoriesMap: Record<ProductCategory, string> = {
    food: '宠物食品',
    toys: '玩具用品',
    accessories: '配件装备',
    healthcare: '医疗保健',
    services: '服务项目',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>商品管理</h1>
        <button
          onClick={() => { setShowForm(true); setEditingProduct(null); }}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.5rem', background: '#667eea', color: 'white' }}
        >
          + 添加商品
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: 'white',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="搜索商品..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '0.6rem 1rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
            }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '0.6rem', border: '1px solid #ddd', borderRadius: '6px' }}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #eee' }}>商品信息</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #eee' }}>分类</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #eee' }}>价格</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #eee' }}>标签</th>
                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #eee' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>加载中...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>暂无商品</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '500', color: '#333' }}>{product.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.25rem' }}>
                        {product.description?.substring(0, 30)}...
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: '#e9ecef',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem'
                      }}>
                        {categoriesMap[product.category] || product.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: '#e91e63' }}>
                      ¥{product.price.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {product.tags?.slice(0, 3).map(tag => (
                        <span key={tag} style={{
                          marginRight: '0.25rem',
                          padding: '0.15rem 0.5rem',
                          background: '#f0f0f0',
                          borderRadius: '3px',
                          fontSize: '0.75rem'
                        }}>
                          {tag}
                        </span>
                      ))}
                      {product.tags?.length! > 3 && (
                        <span style={{ color: '#999', fontSize: '0.8rem' }}>+{product.tags.length - 3}</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(product)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          marginRight: '0.5rem',
                          background: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

// Product Form Modal Component
interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (formData: ProductForm) => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState<ProductForm>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || 'food',
    tags: product?.tags || [],
    imageUrl: product?.imageUrl || '',
  });
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '500px',
        maxWidth: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0 }}>{product ? '编辑商品' : '添加商品'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>商品名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>商品描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>分类</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '6px' }}
              >
                <option value="food">宠物食品</option>
                <option value="toys">玩具用品</option>
                <option value="accessories">配件装备</option>
                <option value="healthcare">医疗保健</option>
                <option value="services">服务项目</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>价格 (元)</label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                min="0"
                step="0.01"
                required
                style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '6px' }}
              />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>图片URL</label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>标签</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                placeholder="输入标签后按回车"
                style={{ flex: 1, padding: '0.6rem', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                style={{ padding: '0.6rem 1rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                添加
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {formData.tags.map(tag => (
                <span key={tag} style={{
                  background: '#e9ecef',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
                  >×</button>
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '0.6rem 1.5rem', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
            >
              取消
            </button>
            <button
              type="submit"
              style={{ padding: '0.6rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductList;
