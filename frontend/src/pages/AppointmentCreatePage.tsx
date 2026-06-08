import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '@/services/authService'
import { appointmentService, AppointmentType, AppointmentStatus } from '@/services/appointmentService'
import MapPicker from '@/components/MapPicker'

const AppointmentCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    type: AppointmentType.GROOMING as AppointmentType,
    title: '',
    description: '',
    scheduledTime: '',
    durationMinutes: 60,
    address: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    phoneNumber: '',
    petInfo: '',
    amount: '',
    paymentMethod: 'WECHAT'
  })

  // 设置默认时间为下一小时
  useEffect(() => {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    now.setMinutes(0)
    now.setSeconds(0)
    now.setMilliseconds(0)

    const formatted = now.toISOString().slice(0, 16)
    setFormData(prev => ({ ...prev, scheduledTime: formatted }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title) {
      alert('请输入标题')
      return
    }

    if (!formData.scheduledTime) {
      alert('请选择服务时间')
      return
    }

    setIsLoading(true)

    try {
      const request = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        scheduledTime: new Date(formData.scheduledTime).toISOString(),
        durationMinutes: formData.durationMinutes,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        phoneNumber: formData.phoneNumber,
        petInfo: formData.petInfo,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        paymentMethod: formData.paymentMethod
      }

      const result = await appointmentService.createRequest(request)
      // 创建成功后，自动发布
      if (result.id) {
        await appointmentService.updateStatus(result.id, AppointmentStatus.PUBLISHED)
        alert('需求发布成功！')
        navigate('/appointments')
      }
    } catch (error) {
      console.error('发布需求失败:', error)
      alert('发布需求失败，请检查输入并重试')
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeText = (type: AppointmentType) => {
    const typeMap = {
      [AppointmentType.GROOMING]: '美容护理',
      [AppointmentType.VETERINARY]: '医疗健康',
      [AppointmentType.BOARDING]: '寄养托管',
      [AppointmentType.TRAINING]: '行为训练',
      [AppointmentType.WALKING]: '遛狗服务',
      [AppointmentType.SITTING]: '上门喂养'
    }
    return typeMap[type] || type
  }

  if (!getToken()) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <h2>请先登录</h2>
        <p>请登录后再创建需求</p>
        <button onClick={() => navigate('/login')} className="btn" style={{ marginTop: '1rem' }}>
          前往登录
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h2>发布需求</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>填写以下信息发布服务需求</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* 服务类型 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            服务类型 *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as AppointmentType })}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value={AppointmentType.GROOMING}>美容护理 - 洗澡、修剪、SPA等</option>
            <option value={AppointmentType.VETERINARY}>医疗健康 - 诊疗、疫苗、驱虫等</option>
            <option value={AppointmentType.BOARDING}>寄养托管 - 宠物酒店、日托等</option>
            <option value={AppointmentType.TRAINING}>行为训练 - 服从训练、行为矫正等</option>
            <option value={AppointmentType.WALKING}>遛狗服务 - 专业遛狗师上门</option>
            <option value={AppointmentType.SITTING}>上门喂养 - 代喂宠物、送药等</option>
          </select>
        </div>

        {/* 需求标题 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            标题 *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="例如：宠物美容需求"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        {/* 服务时间 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            服务时间 *
          </label>
          <input
            type="datetime-local"
            value={formData.scheduledTime}
            onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
            当前选中：{new Date(formData.scheduledTime).toLocaleString('zh-CN')}
          </p>
        </div>

        {/* 时长 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            预计时长（分钟）
          </label>
          <input
            type="number"
            value={formData.durationMinutes}
            onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })}
            min="15"
            step="15"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
            大多数服务为60分钟，请根据实际需求调整
          </p>
        </div>

        {/* 地址 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            服务地址
          </label>
          <MapPicker
            value={formData.address}
            onChange={(address, lat, lng) => {
              setFormData(prev => ({
                ...prev,
                address,
                latitude: lat,
                longitude: lng
              }))
            }}
            placeholder="请输入或选择地址"
          />
          {formData.latitude && formData.longitude && (
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
              坐标: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
            </p>
          )}
        </div>

        {/* 联系电话 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            联系电话
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="请输入手机号"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        {/* 宠物信息 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            宠物信息
          </label>
          <textarea
            value={formData.petInfo}
            onChange={(e) => setFormData({ ...formData, petInfo: e.target.value })}
            placeholder="例如：品种、年龄、性格、健康状况、疫苗情况等"
            rows={3}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}
          />
        </div>

        {/* 金额 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            预计金额
          </label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="可选，输入金额"
            min="0"
            step="0.01"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        {/* 支付方式 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            支付方式
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="WECHAT">微信支付</option>
            <option value="ALIPAY">支付宝支付</option>
            <option value="CASH">现金支付</option>
            <option value="BANK_TRANSFER">银行转账</option>
          </select>
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
            {isLoading ? '发布中...' : '确认发布'}
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

export default AppointmentCreatePage
