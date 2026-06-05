# PetHome 宠物服务平台

一站式宠物服务平台，提供商品购买、服务预约、社区互动等功能。

## 🚀 快速开始

### 开发环境搭建

1. **启动前端** (在一个终端)：
   ```bash
   cd frontend
   npm run dev
   # 运行在 http://localhost:3001
   ```

2. **启动后端** (在另一个终端)：
   ```bash
   cd backend
   mvn spring-boot:run
   # 运行在 http://localhost:8080
   ```

3. **测试 API**：
   ```bash
   cd backend
   mvn test
   ```

### Docker 部署

```bash
docker-compose up -d
```

这将启动：
- MySQL 数据库 (端口 3306)
- Spring Boot 后端 (端口 8080)
- React 前端 (端口 3001)

## 🏗️ 技术架构

### 后端 (Spring Boot)
- **框架**: Spring Boot 3.2.2 + Java 21
- **数据库**: MySQL 8.0 + JPA/Hibernate
- **安全认证**: JWT + BCrypt 密码加密
- **实时通信**: WebSocket 支持
- **AI 集成**: Claude API 内容审核

### 前端 (React + TypeScript)
- **框架**: React 18 + Vite
- **路由**: React Router v6
- **样式**: 响应式 CSS 设计
- **状态管理**: LocalStorage
- **HTTP 客户端**: Axios

## 📦 核心功能

### 用户系统
- 多角色认证 (管理员、供应商、宠物主、服务者)
- 安全密码加密
- 会话管理
- 个人中心页面

### 商品管理
- 商品 CRUD 操作
- 分类筛选 (食品、玩具、配件、医疗)
- 标签搜索
- 商品详情页面

### 订单系统
- 订单生命周期跟踪
- 实时状态更新
- 购物车功能
- 订单历史记录

### 支付集成
- 多种支付方式 (支付宝、微信、线下支付)
- 交易状态跟踪

## 🛠️ API 接口

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户资料

### 商品相关
- `GET /api/products` - 获取商品列表
- `GET /api/products/{id}` - 获取商品详情
- `GET /api/products/category/{category}` - 按分类筛选

### 订单相关
- `GET /api/orders` - 获取订单列表
- `POST /api/orders` - 创建订单

## 🔧 配置说明

### 环境变量
```env
ANTHROPIC_API_KEY=your_claude_api_key
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/pethome
SPRING_DATASOURCE_USERNAME=pethome
SPRING_DATASOURCE_PASSWORD=password
```

### 数据库表结构
主要数据表：
- `users` - 用户账户
- `products` - 商品目录
- `orders` - 订单管理
- `payments` - 支付交易

## 📱 项目结构

```
pethome/
├── backend/              # Spring Boot 后端
│   ├── src/main/java/com/pethome/
│   │   ├── controller/   # 控制器层
│   │   ├── service/      # 业务逻辑层
│   │   ├── model/        # 数据模型
│   │   ├── repository/   # 数据访问层
│   │   └── security/     # 安全认证
│   └── pom.xml
├── frontend/            # React 前端
│   ├── src/
│   │   ├── pages/       # 页面组件
│   │   ├── components/  # 可复用组件
│   │   ├── services/    # API 服务
│   │   └── types/       # TypeScript 类型
│   └── package.json
└── docker-compose.yml   # Docker 部署配置
```

## 🧪 运行测试

```bash
# 前端构建
cd frontend && npm run build

# 后端编译
cd backend && mvn compile

# 后端测试
cd backend && mvn test
```

## 📝 开发计划

- [ ] 支付网关实际集成
- [ ] 微信小程序开发
- [ ] APP 开发 (React Native)
- [ ] 高德地图路径规划
- [ ] AI 内容互动系统
- [ ] 数据监控大盘

## 🔒 安全特性

- BCrypt 密码加密
- CORS 配置
- 输入验证
- JWT 认证

---

**开发团队**: PetHome Dev Team  
**最后更新**: 2026-05-27
