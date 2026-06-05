import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getToken } from '@/services/authService'
import { appointmentService, Appointment, AppointmentStatus, AppointmentType, ServicePhase } from '@/services/appointmentService'

const AppointmentListPage: React.FC = () => {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      const data = await appointmentService.getMyAppointments()
      setAppointments(data)
    } catch (error) {
      console.error('加载预约失败:', error)
      if (!getToken()) {
        navigate('/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const cancelAppointment = async (id: number) => {
    if (!window.confirm('确定要取消这个需求吗？')) return
    try {
      await appointmentService.cancelAppointment(id)
      loadAppointments()
    } catch (error) {
      console.error('取消需求失败:', error)
      alert('取消需求失败，请稍后重试')
    }
  }

  const getServicePhaseSteps = (phase: ServicePhase) => {
    const steps = [
      { key: 'BOOKED', label: '需求创建', done: false, current: false },
      { key: 'PUBLISHED', label: '需求发布', done: false, current: false },
      { key: 'ACCEPTED', label: '服务方接单', done: false, current: false },
      { key: 'PREPARING', label: '上门准备', done: false, current: false },
      { key: 'ARRIVED', label: '入户环节', done: false, current: false },
      { key: 'IN_PROGRESS', label: '提供服务', done: false, current: false },
      { key: 'COMPLETED', label: '服务完成', done: false, current: false },
      { key: 'CLOSED', label: '完成评价', done: false, current: false },
    ]

    const currentIndex = steps.findIndex(s => s.key === phase)
    steps.forEach((step, index) => {
      step.done = index < currentIndex
      step.current = index === currentIndex
    })

    return steps
  }

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.BOOKED: return '#ffc107'
      case AppointmentStatus.ACCEPTED: return '#2196f3'
      case AppointmentStatus.ON_WAY: return '#ff9800'
      case AppointmentStatus.STARTED: return '#4caf50'
      case AppointmentStatus.COMPLETED: return '#9c27b0'
      case AppointmentStatus.PAID: return '#009688'
      case AppointmentStatus.CANCELLED: return '#f44336'
      case AppointmentStatus.NO_SHOW: return '#9e9e9e'
      default: return '#607d8b'
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

  if (isLoading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h2>加载需求中...</h2>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>我的需求</h2>
        <Link to="/appointments/create" className="btn" style={{ backgroundColor: '#2196f3', color: 'white' }}>
          新建需求
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <p style={{ color: '#666' }}>暂无需求记录</p>
          <Link to="/appointments/create" style={{ color: '#2196f3', textDecoration: 'none' }}>
            立即创建需求 →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              style={{
                padding: '1.5rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}
            >
              {/* 状态标签 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: getStatusColor(appointment.status),
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}>
                  {appointment.status === 'BOOKED' ? '待发布' :
                   appointment.status === 'PUBLISHED' ? '待接单' :
                   appointment.status === 'ACCEPTED' ? '已接单' :
                   appointment.status === 'ON_WAY' ? '服务中' :
                   appointment.status === 'STARTED' ? '服务中' :
                   appointment.status === 'COMPLETED' ? '已完成' :
                   appointment.status === 'PAID' ? '已支付' : '已取消'}
                </span>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}>
                  {getTypeText(appointment.type)}
                </span>
              </div>

              {/* 服务流程环节 */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>服务流程</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  {/* 连接线 */}
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    left: '0',
                    right: '0',
                    height: '2px',
                    backgroundColor: '#e0e0e0',
                    zIndex: 0
                  }}></div>
                  {getServicePhaseSteps(appointment.phase).map((step, index) => (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: step.done ? '#4caf50' : step.current ? '#2196f3' : '#e0e0e0',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        marginBottom: '0.25rem'
                      }}>
                        {step.done ? '✓' : index + 1}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: step.current ? '#2196f3' : step.done ? '#666' : '#999'
                      }}>
                        {step.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <h3 style={{ margin: '0.5rem 0' }}>{appointment.title || '无标题需求'}</h3>
              <p style={{ color: '#666', margin: '0.25rem 0' }}>
                📅 服务时间: {new Date(appointment.scheduledTime).toLocaleString('zh-CN')}
                {appointment.durationMinutes && ` (${appointment.durationMinutes}分钟)`}
              </p>
              {appointment.address && (
                <p style={{ color: '#666', margin: '0.25rem 0' }}>
                  📍 地址: {appointment.address}
                </p>
              )}
              {appointment.phoneNumber && (
                <p style={{ color: '#666', margin: '0.25rem 0' }}>
                  📞 电话: {appointment.phoneNumber}
                </p>
              )}
              {appointment.petInfo && (
                <p style={{ color: '#666', margin: '0.25rem 0' }}>
                  🐾 宠物信息: {appointment.petInfo}
                </p>
              )}
              {appointment.amount !== null && (
                <p style={{ color: '#666', margin: '0.25rem 0' }}>
                  💰 金额: ¥{appointment.amount}
                </p>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                <Link
                  to={`/appointments/${appointment.id}`}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    color: '#333'
                  }}
                >
                  详情
                </Link>
                {appointment.status === 'BOOKED' && (
                  <button
                    onClick={() => cancelAppointment(appointment.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    取消需求
                  </button>
                )}
                {appointment.status === 'COMPLETED' && !appointment.review && (
                  <Link
                    to={`/appointments/${appointment.id}/review`}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      borderRadius: '4px',
                      textDecoration: 'none'
                    }}
                  >
                    评价服务
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AppointmentListPage
