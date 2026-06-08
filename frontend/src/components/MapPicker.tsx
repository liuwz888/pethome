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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapLoadedRef = useRef(false);

  // 加载高德地图 JavaScript API
  useEffect(() => {
    // 如果已有 map 对象，跳过加载
    if (window.AMap && window.AMap.Map) {
      mapLoadedRef.current = true;
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    // 使用高德地图 JavaScript API（免费，无需 key）
    script.src = 'https://webapi.amap.com/maps?v=2.0&key=047355483184f73135e9f71f464e37b1';
    script.async = true;
    script.onload = () => {
      console.log('高德地图 API 加载完成');
      mapLoadedRef.current = true;
    };
    script.onerror = () => {
      console.error('高德地图 API 加载失败');
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
    if (!mapLoadedRef.current || !isOpen || !mapContainerRef.current) {
      return;
    }

    // 销毁旧地图
    if (window.mapInstance) {
      window.mapInstance.setMapStyle('normal');
      window.mapInstance = null;
    }

    // 创建地图
    const center = latitude && longitude ? [longitude, latitude] : [116.397428, 39.90923]; // 默认北京
    const map = new window.AMap.Map(mapContainerRef.current, {
      center: center,
      zoom: 13,
      mapStyle: 'normal'
    });

    window.mapInstance = map;

    // 添加点击事件
    const clickHandler = (e: any) => {
      const lng = e.lnglat.getLng();
      const lat = e.lnglat.getLat();

      // 反地理编码获取地址
      window.AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new window.AMap.Geocoder({
          radius: 1000
        });
        geocoder.getAddress([lng, lat], (status: string, result: any) => {
          if (status === 'complete' && result.info === 'OK') {
            const address = result.regeocode.formattedAddress;
            setAddress(address);
            setLatitude(lat);
            setLongitude(lng);
            onChange(address, lat, lng);

            // 更新标记
            map.clearOverlays();
            const marker = new window.AMap.Marker({
              position: [lng, lat],
              title: address
            });
            map.addOverlay(marker);
          }
        });
      });
    };

    const clickListener = map.on('click', clickHandler);

    return () => {
      map.off('click', clickListener);
    };
  }, [isOpen, latitude, longitude]);

  // 搜索地址
  const handleSearch = () => {
    if (!searchQuery.trim() || !mapLoadedRef.current) {
      return;
    }

    setIsLoading(true);
    window.AMap.plugin('AMap.Geocoder', () => {
      const geocoder = new window.AMap.Geocoder({});
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
          if (window.mapInstance) {
            window.mapInstance.setCenter([lng, lat]);
            window.mapInstance.setZoom(15);
            window.mapInstance.clearOverlays();
            const marker = new window.AMap.Marker({
              position: [lng, lat],
              title: location.formattedAddress
            });
            window.mapInstance.addOverlay(marker);
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
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {isOpen ? '收起地图' : '地图选点'}
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
              height: '400px',
              position: 'relative'
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

      {/* 隐藏的高德地图 API 加载状态提示 */}
      <div style={{ display: 'none' }}>
        {mapLoadedRef.current && <span>地图已就绪</span>}
      </div>
    </div>
  );
};

export default MapPicker;
