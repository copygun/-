// Mock 데이터 생성
export const mockLabelLibrary = [
  {
    id: 1,
    labelName: "제품 라벨 A",
    customerCode: "CUST001",
    libraryCode: "LIB001",
    sizeWidth: "50",
    sizeHeight: "30",
    shape: "사각형",
    totalOrderQuantity: "10000",
    unwoundDirection: "상",
    labelTypes: ["제품", "바코드"],
    useEnvironments: ["실내"],
    adhesionSurface: "PET",
    surfaceLayerCount: 1,
    thickness: "0.08",
    color: "백색",
    adhesives: ["영구접착"],
    liners: ["글라신(Glassine B/W)"],
    printMethods: ["오프셋"],
    printColors: { cmyk: true, spot: false, spotCount: 0, iMark: false, other: false },
    uvCoating: { glossGeneral: true, glossRibbon: false, matteGeneral: false, matteRibbon: false },
    laminating: { glossGeneral: false, glossRibbon: false, matteGeneral: false, matteRibbon: false, fullGeneral: false, fullRibbon: false },
    dieCutting: "하프컷",
    inspectionItems: { visual: true, color: true, peel: false, other: false },
    printQuality: "고급",
    packagingMethod: "roll",
    tags: ["제품라벨", "고급"],
    isActive: true,
    createdAt: "2024-01-15T09:00:00.000Z",
    updatedAt: "2024-01-15T09:00:00.000Z"
  },
  {
    id: 2,
    labelName: "바코드 라벨 B",
    customerCode: "CUST002",
    libraryCode: "LIB002",
    sizeWidth: "40",
    sizeHeight: "20",
    shape: "사각형",
    totalOrderQuantity: "5000",
    unwoundDirection: "좌",
    labelTypes: ["바코드"],
    useEnvironments: ["실내", "실외"],
    adhesionSurface: "PP",
    surfaceLayerCount: 1,
    thickness: "0.06",
    color: "백색",
    adhesives: ["영구접착"],
    liners: ["글라신(Glassine B/W)"],
    printMethods: ["디지털"],
    printColors: { cmyk: false, spot: true, spotCount: 1, iMark: false, other: false },
    uvCoating: { glossGeneral: false, glossRibbon: false, matteGeneral: true, matteRibbon: false },
    laminating: { glossGeneral: false, glossRibbon: false, matteGeneral: false, matteRibbon: false, fullGeneral: false, fullRibbon: false },
    dieCutting: "하프컷",
    inspectionItems: { visual: true, color: false, peel: true, other: false },
    printQuality: "일반",
    packagingMethod: "roll",
    tags: ["바코드", "일반"],
    isActive: true,
    createdAt: "2024-01-16T10:30:00.000Z",
    updatedAt: "2024-01-16T10:30:00.000Z"
  },
  {
    id: 3,
    labelName: "표기 라벨 C",
    customerCode: "CUST003",
    libraryCode: "LIB003",
    sizeWidth: "60",
    sizeHeight: "40",
    shape: "원형",
    totalOrderQuantity: "8000",
    unwoundDirection: "하",
    labelTypes: ["표기(덧방)"],
    useEnvironments: ["냉동/냉장"],
    adhesionSurface: "PE",
    surfaceLayerCount: 2,
    thickness: "0.10",
    color: "투명",
    adhesives: ["냉동용"],
    liners: ["PET"],
    printMethods: ["실크스크린"],
    printColors: { cmyk: true, spot: true, spotCount: 2, iMark: true, other: false },
    uvCoating: { glossGeneral: false, glossRibbon: true, matteGeneral: false, matteRibbon: false },
    laminating: { glossGeneral: true, glossRibbon: false, matteGeneral: false, matteRibbon: false, fullGeneral: false, fullRibbon: false },
    dieCutting: "풀컷",
    inspectionItems: { visual: true, color: true, peel: true, other: true, otherText: "내한성 테스트" },
    printQuality: "최고급",
    packagingMethod: "sheet",
    labelsPerSheet: 12,
    sheetsPerBundle: 100,
    tags: ["표기라벨", "냉동용", "최고급"],
    isActive: true,
    createdAt: "2024-01-17T14:15:00.000Z",
    updatedAt: "2024-01-17T14:15:00.000Z"
  }
];

export const mockOrders = [
  {
    id: 1,
    projectNumber: "PRJ2024001",
    orderNumber: "ORD2024001",
    receivedDate: "2024-01-15",
    receiver: "홍길동",
    customerId: 1,
    orderCompany: "ABC 제조업체",
    orderPerson: "김담당",
    productName: "제품 라벨 A",
    productSpecs: "제품 - 50x30mm",
    quantity: "10000",
    orderFormat: "신규발주",
    expectedDeliveryDate: "2024-02-15",
    status: "진행중",
    labelLibraryId: 1,
    createdAt: "2024-01-15T09:00:00.000Z",
    updatedAt: "2024-01-15T09:00:00.000Z"
  },
  {
    id: 2,
    projectNumber: "PRJ2024002",
    orderNumber: "ORD2024002",
    receivedDate: "2024-01-16",
    receiver: "이영희",
    customerId: 2,
    orderCompany: "XYZ 유통",
    orderPerson: "박대리",
    productName: "바코드 라벨 B",
    productSpecs: "바코드 - 40x20mm",
    quantity: "5000",
    orderFormat: "재발주",
    expectedDeliveryDate: "2024-02-10",
    status: "검토중",
    labelLibraryId: 2,
    createdAt: "2024-01-16T10:30:00.000Z",
    updatedAt: "2024-01-16T10:30:00.000Z"
  }
];

export const mockCustomers = [
  {
    id: 1,
    name: "ABC 제조업체",
    contactPerson: "김담당",
    phone: "02-1234-5678",
    email: "contact@abc.com",
    address: "서울시 강남구 테헤란로 123",
    businessRegistrationNumber: "123-45-67890",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    name: "XYZ 유통",
    contactPerson: "박대리",
    phone: "02-2345-6789",
    email: "manager@xyz.com",
    address: "서울시 서초구 서초대로 456",
    businessRegistrationNumber: "234-56-78901",
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z"
  }
];

export const mockUsers = [
  {
    id: 1,
    username: "admin",
    email: "admin@company.com",
    role: "admin",
    position: "관리자",
    phone: "02-1111-2222",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    username: "user1",
    email: "user1@company.com",
    role: "user",
    position: "담당자",
    phone: "02-3333-4444",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  }
];

export const mockMaterials = [
  {
    id: 1,
    name: "PET 필름 80μm",
    materialCode: "MAT001",
    category: "원자재",
    type: "PET",
    description: "고품질 PET 필름",
    thickness: 80,
    width: 1000,
    color: "투명",
    unit: "m²",
    unitPrice: 1500,
    currentStock: 500,
    minimumStock: 50,
    status: "활성",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  }
];

export const mockVendors = [
  {
    id: 1,
    businessName: "재료공급업체 A",
    businessRegistrationNumber: "345-67-89012",
    representativeName: "최대표",
    mainPhone: "02-5555-6666",
    mainEmail: "sales@vendor-a.com",
    businessAddress: "경기도 안산시 단원구 공단로 789",
    supplierType: "원자재공급업체",
    supplierGrade: "A",
    approvalStatus: "승인",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  }
];

// 통계 데이터
export const mockOrderStats = {
  totalOrders: 156,
  newOrders: 12,
  inProgress: 45,
  completed: 99,
  monthlyGrowth: 15.6
};

export const mockReportData = {
  overview: {
    totalRevenue: 125000000,
    totalOrders: 156,
    completionRate: 94.2,
    customerSatisfaction: 4.8
  }
};
