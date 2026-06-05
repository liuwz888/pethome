import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts, getProductsByCategory, searchProductsByTag, Product } from '@/services/productService';

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTag, setSearchTag] = useState('');

  const fetchProducts = async (tag?: string, category?: string) => {
    try {
      setLoading(true);
      let data;
      if (tag) {
        data = await searchProductsByTag(tag);
      } else if (category) {
        data = await getProductsByCategory(category);
      } else {
        data = await getAllProducts();
      }
      setProducts(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || '获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCategoryClick = (category: string) => {
    fetchProducts(undefined, category);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(searchTag.trim() || undefined);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>商品列表</h1>
        <Link to="/" className="btn">返回首页</Link>
      </div>

      <form onSubmit={handleSearch} style={{ margin: '1rem 0', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="搜索标签..."
          value={searchTag}
          onChange={(e) => setSearchTag(e.target.value)}
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button type="submit" className="btn">搜索</button>
        {searchTag && (
          <button type="button" className="btn" onClick={() => { setSearchTag(''); fetchProducts(); }}>
            清除
          </button>
        )}
      </form>

      {loading && <p>加载中...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {products.map((product) => (
          <div key={product.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem' }}>
            <h3><Link to={`/products/${product.id}`}>{product.name}</Link></h3>
            <p>{product.description}</p>
            <p style={{ fontWeight: 'bold', color: '#e91e63' }}>¥{product.price}</p>
            <div>
              {product.tags?.map((tag) => (
                <span key={tag} style={{ background: '#eee', padding: '0.2rem 0.5rem', marginRight: '0.3rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!loading && products.length === 0 && <p>暂无商品</p>}
    </div>
  );
};

export default ProductListPage;
