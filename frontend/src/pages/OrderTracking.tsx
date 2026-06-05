import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const orderStatuses = [
  { key: 'pending', label: '待确认', color: '#ffa500' },
  { key: 'confirmed', label: '已确认', color: '#4169e1' },
  { key: 'in_progress', label: '进行中', color: '#32cd32' },
  { key: 'completed', label: '已完成', color: '#808080' }
]

export default function OrderTracking() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  // TODO: 从API获取订单详情
  const mockOrder = {
    id: parseInt(orderId || '1'),
    orderNumber: `PH${Date.now().toString().slice(-8)}`,
    status: 'confirmed' as const,
    items: [
      { name: '宠物食品套餐', quantity: 1, price: 89.90 },
      { name: '猫玩具套装', quantity: 2, price: 29.90 }
    ],
    totalAmount: 149.70,
    createdAt: new Date().toISOString()
  }

  return (
    <div className="order-tracking">
      <div className="tracking-header">
        <button onClick={() => navigate('/')} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <h2>📦 订单跟踪</h2>
      </div>

      <div className="order-info">
        <div className="order-number">
          <span>订单号：{mockOrder.orderNumber}</span>
        </div>

        {/* 状态追踪 */}
        <div className="status-timeline">
          {orderStatuses.map((status, index) => {
            const isActive = mockOrder.status === status.key
            const isCompleted = orderStatuses.findIndex(s => s.key === mockOrder.status) >= index

            return (
              <div key={status.key} className={`timeline-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <div className="status-dot" style={{ backgroundColor: isActive ? status.color : '#ddd' }}>
                  {isCompleted && <div className="checkmark">✓</div>}
                </div>
                <span className="status-label">{status.label}</span>
              </div>
            )
          })}
        </div>

        {/* 订单详情 */}
        <div className="order-details">
          <h3>订单详情</h3>
          <div className="items-list">
            {mockOrder.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-name">{item.name}</div>
                <div className="item-details">
                  <span>数量：{item.quantity}</span>
                  <span>单价：¥{item.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>创建时间：</span>
              <span>{new Date(mockOrder.createdAt).toLocaleString('zh-CN')}</span>
            </div>
            <div className="summary-row total">
              <span>订单总额：</span>
              <strong>¥{mockOrder.totalAmount.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* 联系客服 */}
        <div className="customer-service">
          <p>如有问题，请联系我们的客服团队</p>
          <button className="contact-btn">联系客服</button>
        </div>
      </div>
    </div>
  )
}