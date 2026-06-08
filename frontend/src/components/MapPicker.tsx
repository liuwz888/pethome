import React, { useEffect, useRef, useState } from 'react';

interface MapPickerProps {
  value?: string;
  onChange: (address: string, latitude?: number, longitude?: number) => void;
  placeholder?: string;
}

const MapPicker: React.FC<MapPickerProps> = ({ value, onChange, placeholder }) => {
  const [address, setAddress] = useState(value || '');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapInitError, setMapInitError] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // 加载高德地图 JavaScript API（使用较老版本，不需要 key）
  useEffect(() => {
    // 如果已有 AMap 对象，跳过加载
    if (window.AMap) {
      setIsMapReady(true);
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    // 使用高德地图 JS API 1.4.15 版本（不需要 key）
    script.src = 'https://webapi.amap.com/maps?v=1.4.15';
    script.async = true;

    script.onload = () => {
      console.log('高德地图 API 加载完成');
      setIsMapReady(true);
    };

    script.onerror = () => {
      console.error('高德地图 API 加载失败');
      setIsMapReady(true);
      setMapInitError(true);
    };
    document.body.appendChild(script);

    return () => {
      // 清理
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // 初始化地图
  useEffect(() => {
    if (!isMapReady || !isOpen || !mapContainerRef.current || mapInitError) {
      return;
    }

    const AMap = window.AMap;
    if (!AMap) {
      console.error('AMap 未定义');
      return;
    }

    // 销毁旧地图
    if (mapInstanceRef.current) {
      mapInstanceRef.current.destroy();
      mapInstanceRef.current = null;
    }

    // 创建地图
    const center = latitude && longitude
      ? [longitude, latitude]
      : [116.397428, 39.90923]; // 默认北京

    const map = new AMap.Map(mapContainerRef.current, {
      center: center,
      zoom: 13
    });

    mapInstanceRef.current = map;

    // 添加点击事件
    const clickListener = AMap.event.addListener(map, 'click', (e: any) => {
      const lng = e.lnglat.getLng();
      const lat = e.lnglat.getLat();

      // 反地理编码获取地址
      AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new AMap.Geocoder();
        geocoder.getAddress([lng, lat], (status: string, result: any) => {
          if (status === 'complete' && result.info === 'OK') {
            const address = result.regeocode.formattedAddress;
            setAddress(address);
            setLatitude(lat);
            setLongitude(lng);
            onChange(address, lat, lng);

            // 更新标记
            mapInstanceRef.current.clearOverlays();
            const marker = new AMap.Marker({
              position: [lng, lat],
              map: mapInstanceRef.current
            });
          }
        });
      });
    });

    return () => {
      if (clickListener) {
        AMap.event.removeListener(clickListener);
      }
    };
  }, [isMapReady, isOpen, latitude, longitude, mapInitError]);

  // 搜索地址
  const handleSearch = () => {
    if (!searchQuery.trim() || !isMapReady || mapInitError) {
      return;
    }

    const AMap = window.AMap;
    if (!AMap) {
      alert('地图服务未就绪，请稍后再试');
      return;
    }

    setIsLoading(true);

    AMap.plugin('AMap.Geocoder', () => {
      const geocoder = new AMap.Geocoder();
      geocoder.getLocation(searchQuery, (status: string, result: any) => {
        setIsLoading(false);
        if (status === 'complete' && result.info === 'OK') {
          const location = result.geocodes[0];
          const lng = location.location.lng;
          const lat = location.location.lat;

          setAddress(location.formattedAddress);
          setLatitude(lat);
          setLongitude(lng);
          onChange(location.formattedAddress, lat, lng);

          // 更新地图
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter([lng, lat]);
            mapInstanceRef.current.setZoom(15);
            mapInstanceRef.current.clearOverlays();
            const marker = new AMap.Marker({
              position: [lng, lat],
              map: mapInstanceRef.current
            });
          }
        } else {
          alert('未找到匹配的位置');
        }
      });
    });
  };

  // 处理地址输入变化
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    onChange(newAddress, latitude, longitude);
  };

  if (mapInitError) {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder={placeholder || '请输入地址'}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
          <button
            disabled
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'not-allowed'
            }}
          >
            地图加载失败
          </button>
        </div>
        <p style={{ color: '#f44336', fontSize: '0.875rem' }}>
          地图服务加载失败，请检查网络连接或稍后重试。
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder={placeholder || '请输入或选择地址'}
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        />
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={!isMapReady}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: !isMapReady ? '#ccc' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !isMapReady ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {isOpen ? '收起地图' : isMapReady ? '地图选点' : '加载地图...'}
        </button>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          marginTop: '0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '0.75rem',
            backgroundColor: 'white',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="输入地址搜索"
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: isLoading ? '#ccc' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? '搜索中...' : '搜索'}
            </button>
          </div>

          {/* 地图容器 */}
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: '400px'
            }}
          />

          {/* 当前位置信息 */}
          {latitude && longitude && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#f5f5f5',
              fontSize: '0.875rem',
              color: '#666',
              borderTop: '1px solid #e0e0e0'
            }}>
              <div>位置: {address}</div>
              <div style={{ fontSize: '0.75rem', color: '#999' }}>
                坐标: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapPicker;
