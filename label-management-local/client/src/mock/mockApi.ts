import {
  mockLabelLibrary,
  mockOrders,
  mockCustomers,
  mockUsers,
  mockMaterials,
  mockVendors,
  mockOrderStats,
  mockReportData
} from './data';

// 정적 빌드 환경인지 확인
const isStaticBuild = typeof process !== 'undefined' && process.env?.STATIC_BUILD === 'true';

// Mock 응답을 Promise로 래핑
const createMockResponse = (data: any) => 
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  }) as Promise<Response>;

// Mock API 서비스
export const mockApiService = {
  // Label Library
  getLabelLibrary: (params?: URLSearchParams) => {
    const search = params?.get('search');
    let data = mockLabelLibrary;
    
    if (search) {
      data = data.filter(item => 
        item.labelName.toLowerCase().includes(search.toLowerCase()) ||
        item.customerCode?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return createMockResponse(data);
  },

  getLabelLibraryItem: (id: number) => {
    const item = mockLabelLibrary.find(item => item.id === id);
    return createMockResponse(item);
  },

  createLabelLibraryItem: (data: any) => {
    const newItem = {
      ...data,
      id: Math.max(...mockLabelLibrary.map(item => item.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockLabelLibrary.push(newItem);
    return createMockResponse(newItem);
  },

  updateLabelLibraryItem: (id: number, data: any) => {
    const index = mockLabelLibrary.findIndex(item => item.id === id);
    if (index !== -1) {
      mockLabelLibrary[index] = {
        ...mockLabelLibrary[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return createMockResponse(mockLabelLibrary[index]);
    }
    throw new Error('Item not found');
  },

  deleteLabelLibraryItem: (id: number) => {
    const index = mockLabelLibrary.findIndex(item => item.id === id);
    if (index !== -1) {
      mockLabelLibrary.splice(index, 1);
    }
    return createMockResponse({ success: true });
  },

  duplicateLabelLibraryItem: (id: number, newName: string) => {
    const original = mockLabelLibrary.find(item => item.id === id);
    if (original) {
      const duplicated = {
        ...original,
        id: Math.max(...mockLabelLibrary.map(item => item.id)) + 1,
        labelName: newName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockLabelLibrary.push(duplicated);
      return createMockResponse(duplicated);
    }
    throw new Error('Item not found');
  },

  // Orders
  getOrders: (params?: URLSearchParams) => {
    return createMockResponse(mockOrders);
  },

  getOrder: (id: number) => {
    const order = mockOrders.find(order => order.id === id);
    return createMockResponse(order);
  },

  getOrderStats: () => {
    return createMockResponse(mockOrderStats);
  },

  createOrder: (data: any) => {
    const newOrder = {
      ...data,
      id: Math.max(...mockOrders.map(order => order.id)) + 1,
      orderNumber: data.orderNumber || `ORD${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockOrders.push(newOrder);
    return createMockResponse(newOrder);
  },

  updateOrder: (id: number, data: any) => {
    const index = mockOrders.findIndex(order => order.id === id);
    if (index !== -1) {
      mockOrders[index] = {
        ...mockOrders[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return createMockResponse(mockOrders[index]);
    }
    throw new Error('Order not found');
  },

  deleteOrder: (id: number) => {
    const index = mockOrders.findIndex(order => order.id === id);
    if (index !== -1) {
      mockOrders.splice(index, 1);
    }
    return createMockResponse({ success: true });
  },

  // 기타 API들...
  getCustomers: () => createMockResponse(mockCustomers),
  getUsers: () => createMockResponse(mockUsers),
  getMaterials: () => createMockResponse(mockMaterials),
  getVendors: () => createMockResponse(mockVendors),
  getReportData: () => createMockResponse(mockReportData)
};

// 원본 fetch 함수 저장
const originalFetch = globalThis.fetch;

// Fetch 인터셉터 설치
export const installMockApi = () => {
  if (typeof window === 'undefined') return;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method || 'GET';

    // API 경로 매칭
    if (url.startsWith('/api/')) {
      const urlObj = new URL(url, window.location.origin);
      const pathname = urlObj.pathname;
      const searchParams = urlObj.searchParams;

      try {
        // Label Library API
        if (pathname === '/api/label-library' && method === 'GET') {
          return await mockApiService.getLabelLibrary(searchParams);
        }
        if (pathname.match(/^\/api\/label-library\/(\d+)$/) && method === 'GET') {
          const id = parseInt(pathname.split('/')[3]);
          return await mockApiService.getLabelLibraryItem(id);
        }
        if (pathname === '/api/label-library' && method === 'POST') {
          const data = init?.body ? JSON.parse(init.body as string) : {};
          return await mockApiService.createLabelLibraryItem(data);
        }
        if (pathname.match(/^\/api\/label-library\/(\d+)$/) && method === 'PUT') {
          const id = parseInt(pathname.split('/')[3]);
          const data = init?.body ? JSON.parse(init.body as string) : {};
          return await mockApiService.updateLabelLibraryItem(id, data);
        }
        if (pathname.match(/^\/api\/label-library\/(\d+)$/) && method === 'DELETE') {
          const id = parseInt(pathname.split('/')[3]);
          return await mockApiService.deleteLabelLibraryItem(id);
        }
        if (pathname.match(/^\/api\/label-library\/(\d+)\/duplicate$/) && method === 'POST') {
          const id = parseInt(pathname.split('/')[3]);
          const data = init?.body ? JSON.parse(init.body as string) : {};
          return await mockApiService.duplicateLabelLibraryItem(id, data.newName);
        }

        // Orders API
        if (pathname === '/api/orders/stats' && method === 'GET') {
          return await mockApiService.getOrderStats();
        }
        if (pathname === '/api/orders' && method === 'GET') {
          return await mockApiService.getOrders(searchParams);
        }
        if (pathname.match(/^\/api\/orders\/(\d+)$/) && method === 'GET') {
          const id = parseInt(pathname.split('/')[3]);
          return await mockApiService.getOrder(id);
        }
        if (pathname === '/api/orders' && method === 'POST') {
          const data = init?.body ? JSON.parse(init.body as string) : {};
          return await mockApiService.createOrder(data);
        }

        // 기타 API들도 동일하게 처리...
        // 기본 응답
        return createMockResponse({ message: 'API not implemented in mock' });

      } catch (error) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: error.message }),
          text: () => Promise.resolve(error.message)
        }) as Promise<Response>;
      }
    }

    // API가 아닌 요청은 원본 fetch 사용
    return originalFetch(input, init);
  };
};

// Mock API 제거
export const uninstallMockApi = () => {
  if (typeof window !== 'undefined' && originalFetch) {
    window.fetch = originalFetch;
  }
};
