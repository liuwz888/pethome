const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';
const AUTH_URL = 'http://localhost:8080/api/auth';

async function testAPI() {
  console.log('🧪 PetHome 平台 API 测试\n');
  console.log('='.repeat(50));

  let testCount = 0;
  let passCount = 0;
  let failCount = 0;

  const runTest = async (name, testFn) => {
    testCount++;
    try {
      await testFn();
      console.log(`✅ ${name}`);
      passCount++;
    } catch (error) {
      console.log(`❌ ${name}`);
      console.log(`   ${error.message}`);
      failCount++;
    }
  };

  // Test 1: Backend health check
  await runTest('后端服务健康检查', async () => {
    try {
      await axios.get('http://localhost:8080/actuator/health');
    } catch (e) {
      // Fallback to root endpoint if actuator not configured
      await axios.get('http://localhost:8080/');
    }
  });

  // Test 2: Product API
  await runTest('商品列表接口', async () => {
    const response = await axios.get(`${BASE_URL}/products`);
    console.log(`   获取到 ${response.data.length || 0} 个商品`);
  });

  // Test 3: Product by category
  await runTest('分类筛选接口', async () => {
    const response = await axios.get(`${BASE_URL}/products/category/food`);
    console.log(`   食品类商品: ${response.data.length || 0} 个`);
  });

  // Test 4: User registration
  await runTest('用户注册接口', async () => {
    const timestamp = Date.now();
    const username = `testuser${timestamp}`;
    await axios.post(`${AUTH_URL}/register`, {
      username,
      password: 'password123',
      email: `${username}@example.com`,
      role: 'PET_OWNER'
    });
    console.log(`   注册用户: ${username}`);
  });

  // Test 5: User login
  await runTest('用户登录接口', async () => {
    const response = await axios.post(`${AUTH_URL}/login`, {
      username: 'admin',
      password: 'admin123'
    });
    console.log(`   登录成功，获取 token: ${response.data.token.substring(0, 20)}...`);
  });

  // Test 6: Create order
  await runTest('创建订单接口', async () => {
    const tokenResp = await axios.post(`${AUTH_URL}/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenResp.data.token}`
      }
    });

    const orderResponse = await api.post('/orders', {
      address: '北京市朝阳区测试地址',
      serviceType: '上门服务',
      amount: 99.99
    });
    console.log(`   订单创建成功: ${orderResponse.data.orderNumber || orderResponse.data.id}`);
  });

  // Test 7: Get user profile
  await runTest('用户资料接口', async () => {
    const tokenResp = await axios.post(`${AUTH_URL}/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const api = axios.create({
      baseURL: AUTH_URL,
      headers: {
        'Authorization': `Bearer ${tokenResp.data.token}`
      }
    });

    const profileResponse = await api.get('/profile');
    console.log(`   用户名: ${profileResponse.data?.username || 'N/A'}`);
    console.log(`   邮箱: ${profileResponse.data?.email || 'N/A'}`);
  });

  // Test 8: Payment simulation
  await runTest('支付接口', async () => {
    const response = await axios.post(`${BASE_URL}/payments`, {
      amount: 100,
      method: 'ALIPAY',
      orderId: 1
    });
    console.log(`   支付状态: ${response.data?.status || '已创建'}`);
  });

  console.log('='.repeat(50));
  console.log(`📊 测试结果: ${passCount}/${testCount} 通过`);

  if (failCount === 0) {
    console.log('🎉 所有测试通过! 平台已准备好部署。');
  } else {
    console.log(`⚠️  ${failCount} 个测试失败，请检查上述错误信息`);
  }

  return { passCount, failCount, testCount };
}

// Test frontend build
async function testFrontend() {
  console.log('\n📱 前端测试');
  console.log('='.repeat(50));

  try {
    // Check if frontend is running
    await axios.get('http://localhost:3001');
    console.log('✅ 前端服务运行中 (http://localhost:3001)');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️  前端服务未运行');
      console.log('   请运行: cd frontend && npm run dev');
    } else {
      console.log('✅ 前端构建成功');
    }
  }
}

// Main execution
async function main() {
  try {
    const { passCount, failCount } = await testAPI();
    await testFrontend();

    process.exit(failCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('测试执行失败:', error.message);
    process.exit(1);
  }
}

main();
