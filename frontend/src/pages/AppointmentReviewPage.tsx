import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getToken } from '@/services/authService'
import { appointmentService, ReviewRequest } from '@/services/appointmentService'

const AppointmentReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<ReviewRequest>({
    rating: 5,
    content: '',
    serviceAttitudeRating: 5,
    professionalRating: 5,
    speedRating: 5,
    isAnonymous: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setIsLoading(true)
    try {
      await appointmentService.addReview(Number(id), formData)
      alert('评价提交成功！')
      navigate('/appointments')
    } catch (error) {
      console.error('提交评价失败:', error)
      alert('提交评价失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const getStarRating = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h2>评价服务</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>请对本次服务进行评价</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 综合评分 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            综合评分 *
          </label>
          <div style={{ fontSize: '2rem', color: '#ffc107' }}>
            {getStarRating(formData.rating)}
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
            style={{ width: '100%', marginTop: '0.5rem' }}
          />
          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            {formData.rating === 5 ? '非常满意' :
             formData.rating === 4 ? '满意' :
             formData.rating === 3 ? '一般' :
             formData.rating === 2 ? '不满意' : '非常不满意'}
          </p>
        </div>

        {/* 服务态度评分 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            服务态度评分
          </label>
          <div style={{ fontSize: '1.5rem', color: '#ffc107' }}>
            {getStarRating(formData.serviceAttitudeRating || 5)}
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={formData.serviceAttitudeRating || 5}
            onChange={(e) => setFormData({ ...formData, serviceAttitudeRating: parseInt(e.target.value) })}
            style={{ width: '100%', marginTop: '0.5rem' }}
          />
        </div>

        {/* 专业水平评分 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            专业水平评分
          </label>
          <div style={{ fontSize: '1.5rem', color: '#ffc107' }}>
            {getStarRating(formData.professionalRating || 5)}
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={formData.professionalRating || 5}
            onChange={(e) => setFormData({ ...formData, professionalRating: parseInt(e.target.value) })}
            style={{ width: '100%', marginTop: '0.5rem' }}
          />
        </div>

        {/* 服务速度评分 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            服务速度评分
          </label>
          <div style={{ fontSize: '1.5rem', color: '#ffc107' }}>
            {getStarRating(formData.speedRating || 5)}
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={formData.speedRating || 5}
            onChange={(e) => setFormData({ ...formData, speedRating: parseInt(e.target.value) })}
            style={{ width: '100%', marginTop: '0.5rem' }}
          />
        </div>

        {/* 评价内容 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            评价内容
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="请输入您的评价..."
            rows={4}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}
          />
        </div>

        {/* 匿名评价 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="anonymous"
            checked={formData.isAnonymous || false}
            onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
          />
          <label htmlFor="anonymous" style={{ fontWeight: 'normal' }}>匿名评价</label>
        </div>

        {/* 提交按钮 */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="submit"
            className="btn"
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
            disabled={isLoading}
          >
            {isLoading ? '提交中...' : '提交评价'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/appointments')}
            className="btn"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#e0e0e0',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}

export default AppointmentReviewPage
