import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import axios from 'axios'

type OrderStatus = 'PENDING' | 'PAID' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待支付', color: '#ffa500' },
  PAID: { label: '已支付', color: '#2196f3' },
  IN_SERVICE: { label: '服务中', color: '#9c27b0' },
  COMPLETED: { label: '已完成', color: '#4caf50' },
  CANCELLED: { label: '已取消', color: '#f44336' },
  REFUNDED: { label: '已退款', color: '#757575' }
}

interface OrderItem {
  name: string
  quantity: number
  price: number
}

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/orders/${orderId}`)
        setOrder(response.data)
        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch order:', err)
        setError('获取订单详情失败')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status?status=${newStatus}`)
      setOrder((prev: any) => ({ ...prev, status: newStatus }))
    } catch (err) {
      alert('更新订单状态失败')
    }
  }

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="loading">加载中...</div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="order-detail-page">
        <div className="error-state">
          <p>{error || '订单不存在'}</p>
          <Link to="/orders" className="btn">返回订单列表</Link>
        </div>
      </div>
    )
  }

  const statusInfo = statusMap[order.status] || { label: order.status, color: '#999' }

  return (
    <div className="order-detail-page">
      <div className="order-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <h2>订单详情</h2>
        <div className="order-badge" style={{ backgroundColor: statusInfo.color }}>
          {statusInfo.label}
        </div>
      </div>

      <div className="order-info-card">
        <div className="order-header-info">
          <div className="order-number">
            <span>订单号：</span>
            <strong>{order.orderNumber || `#${order.id}`}</strong>
          </div>
          <div className="order-date">
            <span>创建时间：</span>
            <span>{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
          </div>
        </div>

        {/* 订单状态追踪 */}
        <div className="status-tracking">
          <div className="status-steps">
            {[
              { key: 'PENDING', label: '待支付' },
              { key: 'PAID', label: '已支付' },
              { key: 'IN_SERVICE', label: '服务中' },
              { key: 'COMPLETED', label: '已完成' }
            ].map((step, index, arr) => {
              const currentIndex = Object.keys(statusMap).indexOf(order.status)
              const isCompleted = currentIndex >= arr.indexOf(step)
              const isCurrent = step.key === order.status

              return (
                <div key={step.key} className={`status-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                  <div className="step-dot">{isCompleted ? '✓' : index + 1}</div>
                  <span className="step-label">{step.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 订单商品 */}
        <div className="order-items">
          <h3>商品清单</h3>
          <div className="items-list">
            {order.items || [
              {
                name: order.product?.name || '商品',
                quantity: 1,
                price: order.amount || 0
              }
            ].map((item: OrderItem, index: number) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <div className="item-name">{item.name}</div>
                  <div className="item-qty">x{item.quantity}</div>
                </div>
                <div className="item-price">¥{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 订单摘要 */}
        <div className="order-summary">
          <div className="summary-row">
            <span>商品金额</span>
            <span>¥{order.amount?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="summary-row">
            <span>服务类型</span>
            <span>{order.serviceType || '上门服务'}</span>
          </div>
          <div className="summary-row">
            <span>配送地址</span>
            <span>{order.address || '未填写'}</span>
          </div>
          <div className="summary-row total">
            <span>实付金额</span>
            <strong>¥{order.amount?.toFixed(2) || '0.00'}</strong>
          </div>
        </div>

        {/* 预约信息 */}
        {order.scheduledTime && (
          <div className="appointment-info">
            <h3>预约信息</h3>
            <div className="appointment-detail">
              <span>预约时间：</span>
              <span>{new Date(order.scheduledTime).toLocaleString('zh-CN')}</span>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="order-actions">
          {order.status === 'PENDING' && (
            <button className="btn btn-primary" onClick={() => handleStatusChange('PAID')}>
              确认支付
            </button>
          )}
          {order.status === 'PAID' && (
            <button className="btn btn-primary" onClick={() => handleStatusChange('IN_SERVICE')}>
              开始服务
            </button>
          )}
          {order.status === 'IN_SERVICE' && (
            <button className="btn btn-success" onClick={() => handleStatusChange('COMPLETED')}>
              完成服务
            </button>
          )}
          <Link to="/orders" className="btn btn-secondary">
            返回订单列表
          </Link>
        </div>
      </div>
    </div>
  )
}
