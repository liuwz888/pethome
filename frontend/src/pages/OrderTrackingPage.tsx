import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Package, CheckCircle, Clock, Calendar, User } from 'lucide-react';
import { productService } from '@/services/api';

const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderId = parseInt(id || '0');
      if (orderId > 0) {
        // For now, use mock data since real API might not be available
        setOrder({
          id: orderId,
          orderNumber: `PH${orderId.toString().padStart(8, '0')}`,
          status: 'confirmed',
          items: [
            { name: '宠物食品套餐 - 5kg', quantity: 1, price: 129.90 },
            { name: '猫玩具套装 - 羽毛逗猫棒', quantity: 2, price: 39.80 }
          ],
          totalAmount: 209.50,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          statusSteps: [
            { status: 'pending', label: '待支付', icon: Clock, completed: true, timestamp: Date.now() - 86400000 },
            { status: 'confirmed', label: '已确认', icon: CheckCircle, completed: true, timestamp: Date.now() - 72000000 },
            { status: 'in_progress', label: '服务中', icon: Truck, completed: false, timestamp: null },
            { status: 'completed', label: '已完成', icon: CheckCircle, completed: false, timestamp: null }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { label: '待支付', color: '#ffa500', icon: Clock };
      case 'confirmed': return { label: '已确认', color: '#4169e1', icon: CheckCircle };
      case 'in_progress': return { label: '服务中', color: '#32cd32', icon: Truck };
      case 'completed': return { label: '已完成', color: '#808080', icon: CheckCircle };
      default: return { label: status, color: '#999', icon: Clock };
    }
  };

  const formatDateTime = (timestamp: number | null) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e9ecef',
            borderLeftColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>加载订单中...</p>
        </div>
      </div>
    );
  }

  if (!order) {
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
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>订单未找到</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          订单号 {id} 不存在或无法访问
        </p>
        <button
          onClick={() => navigate('/orders')}
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
          查看我的订单
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => navigate('/orders')}
          style={{
            padding: '0.6rem',
            background: '#f0f0f0',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            transition: 'all 0.3s ease'
          }}
        >
          <ArrowLeft size={20} color="#666" />
        </button>
        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#333' }}>
          订单跟踪
        </h1>
      </div>

      {/* Order Info Card */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '2px solid #f0f0f0'
        }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#999', marginBottom: '0.5rem' }}>
              订单号
            </div>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: '#333',
              fontFamily: 'monospace'
            }}>
              {order.orderNumber}
            </div>
          </div>
          <div style={{
            padding: '0.5rem 1.2rem',
            background: '#e8f5e9',
            color: '#2e7d32',
            borderRadius: '20px',
            fontWeight: '600'
          }}>
            {getStatusInfo(order.status).label}
          </div>
        </div>

        {/* Status Timeline */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.1rem',
            color: '#333',
            marginBottom: '1.5rem'
          }}>
            配送进度
          </h3>
          <div style={{ position: 'relative' }}>
            {/* Connecting Line */}
            <div style={{
              position: 'absolute',
              left: '40px',
              top: '20px',
              bottom: '20px',
              width: '2px',
              background: '#e0e0e0'
            }} />

            {order.statusSteps.map((step: any, index: number) => {
              const isCompleted = order.statusSteps.findIndex((s: any) => s.status === order.status) >= index;
              const isActive = step.status === order.status;

              return (
                <div key={step.status} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '2rem',
                  position: 'relative',
                  paddingLeft: '40px'
                }}>
                  {/* Status Dot */}
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isCompleted ? step.icon === CheckCircle ? '#4caf50' : step.icon === Clock ? '#ffa500' : '#4169e1' : '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2
                  }}>
                    {isCompleted && (
                      <CheckCircle size={14} color="white" strokeWidth={3} />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, marginLeft: '16px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.25rem'
                    }}>
                      <step.icon size={16} color={isCompleted ? '#333' : '#999'} />
                      <span style={{
                        fontWeight: isActive ? 'bold' : '500',
                        color: isActive ? '#667eea' : isCompleted ? '#333' : '#999'
                      }}>
                        {step.label}
                      </span>
                    </div>
                    {step.timestamp && (
                      <div style={{ fontSize: '0.85rem', color: '#999' }}>
                        {formatDateTime(step.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.1rem',
            color: '#333',
            marginBottom: '1.5rem'
          }}>
            订单详情
          </h3>
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            {order.items.map((item: any, index: number) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 0',
                borderBottom: index < order.items.length - 1 ? '1px solid #e0e0e0' : 'none'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', color: '#333' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#999' }}>
                    x{item.quantity} ¥{item.price.toFixed(2)}
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#333' }}>
                  ¥{(item.quantity * item.price).toFixed(2)}
                </div>
              </div>
            ))}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 0',
              marginTop: '1rem',
              borderTop: '2px solid #ddd',
              paddingTop: '1rem'
            }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                总金额
              </span>
              <span style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#667eea'
              }}>
                ¥{order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Info Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <Calendar size={24} color="#667eea" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              下单时间
            </div>
            <div style={{ fontSize: '0.9rem', color: '#333' }}>
              {new Date(order.createdAt).toLocaleDateString('zh-CN')}
            </div>
          </div>
          <div style={{
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <Package size={24} color="#667eea" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              商品数量
            </div>
            <div style={{ fontSize: '0.9rem', color: '#333' }}>
              {order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} 件
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => navigate('/orders')}
          style={{
            padding: '1rem 2.5rem',
            background: 'white',
            color: '#667eea',
            border: '2px solid #667eea',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          返回订单列表
        </button>
        <button
          style={{
            padding: '1rem 2.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <User size={18} />
          联系客服
        </button>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
