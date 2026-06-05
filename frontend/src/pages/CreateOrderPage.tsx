import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productService } from '@/services/api';
import { ShoppingBag, MapPin, Clock, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { items: cartItems, totalAmount: cartTotal, productId: fromProduct } = (location.state || {}) as {
    items?: CartItem[];
    totalAmount?: number;
    productId?: number;
  };

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    address: '',
    serviceType: '上门服务',
    scheduledTime: '',
    paymentMethod: 'wechat',
    quantity: 1,
    note: ''
  });

  useEffect(() => {
    if (fromProduct) {
      loadProduct(fromProduct);
    }
  }, [fromProduct]);

  const loadProduct = async (id: number) => {
    try {
      const data = await productService.getProductById(id);
      setProduct(data);
      setFormData(prev => ({ ...prev, quantity: 1 }));
    } catch (error) {
      console.error('Failed to load product:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.address) {
      setError('请输入服务地址');
      return;
    }

    if (!formData.scheduledTime) {
      setError('请选择预约时间');
      return;
    }

    setLoading(true);

    try {
      const orderData: any = {
        address: formData.address,
        serviceType: formData.serviceType,
        scheduledTime: formData.scheduledTime,
        paymentMethod: formData.paymentMethod,
        amount: cartTotal || (product?.price || 0) * formData.quantity,
        type: fromProduct ? 'PRODUCT' : 'SERVICE'
      };

      if (fromProduct) {
        orderData.productId = fromProduct;
        orderData.items = [{
          productId: fromProduct,
          quantity: formData.quantity
        }];
      }

      await productService.createOrder(orderData);
      setSuccess(true);

      // Clear cart if order was from cart
      if (cartItems) {
        cartItems.forEach(item => {
          productService.deleteProduct(item.id).catch(() => {});
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '创建订单失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cartTotal || (product?.price || 0) * formData.quantity;

  const serviceTypes = ['上门服务', '到店服务', '寄养服务', '宠物美容', '宠物医疗', '宠物训练'];

  if (success) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <CheckCircle size={48} color="white" />
          </div>
          <h2 style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '1rem'
          }}>
            订单创建成功！
          </h2>
          <p style={{
            color: '#666',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            感谢您的订单，我们会尽快处理并联系您确认服务时间。
          </p>
          <button
            onClick={() => navigate('/orders')}
            style={{
              padding: '1rem 2.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}
          >
            查看订单
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => navigate(-1)}
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
          <AlertCircle size={20} color="#666" />
        </button>
        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#333' }}>
          创建订单
        </h1>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem'
      }}>
        {/* Order Form */}
        <div style={{}}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '1.2rem',
              color: '#333',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #f0f0f0'
            }}>
              订单信息
            </h2>

            {error && (
              <div style={{
                background: '#fee2e2',
                color: '#e91e63',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Service Type */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  <MapPin size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                  服务类型
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                >
                  {serviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  <MapPin size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                  服务地址
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="请输入详细的服务地址"
                  required
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Scheduled Time */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  <Clock size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                  预约时间
                </label>
                <input
                  type="datetime-local"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Payment Method */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  <CreditCard size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                  支付方式
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                >
                  <option value="wechat">微信支付</option>
                  <option value="alipay">支付宝</option>
                  <option value="offline">线下支付</option>
                </select>
              </div>

              {/* Note */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  备注信息（选填）
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="请输入您的特殊要求..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? '提交中...' : '提交订单'}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            height: 'fit-content'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '1.2rem',
              color: '#333',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #f0f0f0'
            }}>
              订单详情
            </h2>

            {fromProduct && product ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ShoppingBag size={32} color="rgba(255,255,255,0.5)" />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
                    {product.name}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    单价：¥{product.price.toFixed(2)}
                  </div>
                </div>
              </div>
            ) : cartItems ? (
              <div style={{ marginBottom: '1.5rem' }}>
                {cartItems.map(item => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', color: '#333' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        x{item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>
                      ¥{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Quantity Selector (if product) */}
            {fromProduct && product && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <span style={{ fontWeight: '500', color: '#333' }}>数量：</span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                    disabled={formData.quantity <= 1}
                    style={{
                      width: '30px',
                      height: '30px',
                      border: 'none',
                      background: 'white',
                      borderRadius: '6px',
                      cursor: formData.quantity <= 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '30px', textAlign: 'center' }}>{formData.quantity}</span>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                    style={{
                      width: '30px',
                      height: '30px',
                      border: 'none',
                      background: 'white',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem 0',
              borderTop: '2px solid #f0f0f0',
              marginTop: '1rem'
            }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                应付金额
              </span>
              <span style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#667eea'
              }}>
                ¥{totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderPage;
