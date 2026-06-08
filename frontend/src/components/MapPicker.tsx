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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // 加载腾讯地图 JavaScript API
  useEffect(() => {
    // 如果已有 qq.Map 对象，跳过加载
    if (window.qq && window.qq.Map) {
      setIsMapReady(true);
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    // 使用腾讯地图 JavaScript API（免费，无需 key）
    script.src = 'https://map.qq.com/api/js?v=3.exp&callback=initMap';
    script.async = true;

    // 定义全局回调函数
    (window as any).initMap = () => {
      console.log('腾讯地图 API 加载完成');
      setIsMapReady(true);
    };

    script.onerror = () => {
      console.error('腾讯地图 API 加载失败');
      setIsMapReady(true); // 即使加载失败也设置为 ready，避免无限等待
    };
    document.body.appendChild(script);

    return () => {
      // 清理
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if ((window as any).initMap) {
        delete (window as any).initMap;
      }
    };
  }, []);

  // 初始化地图
  useEffect(() => {
    if (!isMapReady || !isOpen || !mapContainerRef.current) {
      return;
    }

    // 等待 qq.maps 确实可用
    if (!window.qq || !window.qq.maps) {
      console.error('qq.maps 未定义');
      return;
    }

    // 销毁旧地图
    if (mapInstanceRef.current) {
      mapInstanceRef.current.destroy();
      mapInstanceRef.current = null;
    }

    // 创建地图
    const center = latitude && longitude
      ? new window.qq.maps.LatLng(latitude, longitude)
      : new window.qq.maps.LatLng(39.90923, 116.397428); // 默认北京

    const map = new window.qq.maps.Map(mapContainerRef.current, {
      center: center,
      zoom: 13
    });

    mapInstanceRef.current = map;

    // 添加点击事件
    const clickListener = window.qq.maps.event.addListener(map, 'click', (e: any) => {
      const lat = e.latLng.getLat();
      const lng = e.latLng.getLng();

      // 反地理编码获取地址
      const geocoder = new window.qq.maps.Geocoder({
        complete: (result: any) => {
          if (result.detail) {
            const address = result.detail.formattedAddress;
            setAddress(address);
            setLatitude(lat);
            setLongitude(lng);
            onChange(address, lat, lng);

            // 更新标记
            mapInstanceRef.current.clearOverlays();
            const marker = new window.qq.maps.Marker({
              position: e.latLng,
              map: mapInstanceRef.current
            });
            marker.setLabel({
              content: address,
              offset: new window.qq.maps.Size(0, -20)
            });
          }
        }
      });
      geocoder.getAddress(e.latLng);
    });

    return () => {
      if (clickListener) {
        window.qq.maps.event.removeListener(clickListener);
      }
    };
  }, [isMapReady, isOpen, latitude, longitude]);

  // 搜索地址
  const handleSearch = () => {
    if (!searchQuery.trim() || !isMapReady) {
      return;
    }

    if (!window.qq || !window.qq.maps) {
      alert('地图服务未就绪，请稍后再试');
      return;
    }

    setIsLoading(true);

    const geocoder = new window.qq.maps.Geocoder({
      complete: (result: any) => {
        setIsLoading(false);
        if (result && result.detail) {
          const location = result.detail;
          const lng = location.latLng.getLng();
          const lat = location.latLng.getLat();

          setAddress(location.formattedAddress);
          setLatitude(lat);
          setLongitude(lng);
          onChange(location.formattedAddress, lat, lng);

          // 更新地图
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(new window.qq.maps.LatLng(lat, lng));
            mapInstanceRef.current.setZoom(15);
            mapInstanceRef.current.clearOverlays();
            const marker = new window.qq.maps.Marker({
              position: new window.qq.maps.LatLng(lat, lng),
              map: mapInstanceRef.current
            });
            marker.setLabel({
              content: location.formattedAddress,
              offset: new window.qq.maps.Size(0, -20)
            });
          }
        } else {
          alert('未找到匹配的位置');
        }
      }
    });

    geocoder.getLocation(searchQuery);
  };

  // 处理地址输入变化
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    onChange(newAddress, latitude, longitude);
  };

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
