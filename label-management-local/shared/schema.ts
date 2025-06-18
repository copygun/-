import { pgTable, text, integer, serial, timestamp, boolean, decimal, date, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("user"),
  position: text("position"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Label Library Schema
export const labelLibrary = pgTable("label_library", {
  id: serial("id").primaryKey(),
  // Basic Information
  labelName: text("label_name").notNull(),
  customerCode: text("customer_code"),
  libraryCode: text("library_code"),
  otherCode: text("other_code"),
  
  // Section 3: Basic Label Specifications (reordered)
  sizeWidth: text("size_width"),
  sizeHeight: text("size_height"),
  shape: text("shape"), // 사각형, 원형, 타원형, 기타
  shapeOther: text("shape_other"),
  totalOrderQuantity: text("total_order_quantity"),
  unwoundDirection: text("unwound_direction"), // 상, 하, 좌, 우, 기타
  unwoundDirectionOther: text("unwound_direction_other"),
  labelTypes: json("label_types").$type<string[]>().default([]), // 제품, 표기(덧방), 바코드, 용기 리드씰, 개봉방지
  labelTypesOther: text("label_types_other"),
  useEnvironments: json("use_environments").$type<string[]>().default([]), // 실내, 실외, 냉동/냉장, 고온, 습도, 기타
  useEnvironmentsOther: text("use_environments_other"),
  adhesionSurface: text("adhesion_surface"), // PET, PP, PE, HDPE, LDPE, 유리, 금속, 기타
  adhesionSurfaceOther: text("adhesion_surface_other"),
  
  // Section 4: Material and Quality Specifications
  surfaceLayerCount: integer("surface_layer_count").default(1),
  surfaceLayerDetails: json("surface_layer_details").$type<Array<{layer: number, material: string, materialOther?: string}>>().default([]),
  thickness: decimal("thickness", { precision: 10, scale: 2 }),
  color: text("color"), // 백색, 투명, 은색, 기타
  colorOther: text("color_other"),
  adhesives: json("adhesives").$type<string[]>().default([]), // 영구접착, 리무버블, 강점착, 냉동용, 고온용
  liners: json("liners").$type<string[]>().default([]), // 글라신(Glassine B/W), 황지(YP), PET, PP코팅, PE코팅, 기타
  linersOther: text("liners_other"),
  
  // Section 5: Printing Specifications
  printMethods: json("print_methods").$type<string[]>().default([]), // 레터프레스, 오프셋, 실크스크린, 디지털, 기타
  printMethodsOther: text("print_methods_other"),
  printColors: json("print_colors").$type<{cmyk: boolean, spot: boolean, spotCount: number, iMark: boolean, other: boolean}>().default({cmyk: false, spot: false, spotCount: 0, iMark: false, other: false}),
  printColorsOther: text("print_colors_other"),
  pantoneColors: json("pantone_colors").$type<Array<{spotNumber: number, pantoneCode: string}>>().default([]),
  specialPrint: json("special_print").$type<{hotFoil: boolean, hotFoilDetails?: string, coldFoil: boolean, coldFoilDetails?: string}>().default({hotFoil: false, coldFoil: false}),
  
  // Section 6: Processing and Finishing (updated)
  uvCoating: json("uv_coating").$type<{
    glossGeneral: boolean, 
    glossRibbon: boolean, 
    matteGeneral: boolean, 
    matteRibbon: boolean
  }>().default({glossGeneral: false, glossRibbon: false, matteGeneral: false, matteRibbon: false}),
  laminating: json("laminating").$type<{
    glossGeneral: boolean, 
    glossRibbon: boolean, 
    matteGeneral: boolean, 
    matteRibbon: boolean,
    fullGeneral: boolean,
    fullRibbon: boolean
  }>().default({glossGeneral: false, glossRibbon: false, matteGeneral: false, matteRibbon: false, fullGeneral: false, fullRibbon: false}),
  otherProcessing: text("other_processing"),
  dieCutting: text("die_cutting").default("하프컷"), // 하프컷, 풀컷, 기타
  dieCuttingOther: text("die_cutting_other"),
  
  // Section 8: Quality Standards and Inspection (reordered)
  inspectionItems: json("inspection_items").$type<{visual: boolean, color: boolean, peel: boolean, other: boolean, otherText?: string}>().default({visual: false, color: false, peel: false, other: false}),
  colorDifferenceCriteria: json("color_difference_criteria").$type<{deltaEAb: boolean, deltaEAbValue?: number, deltaE00: boolean, deltaE00Value?: number}>().default({deltaEAb: false, deltaE00: false}),
  printQuality: text("print_quality"), // 일반, 고급, 최고급
  deliveryDocuments: json("delivery_documents").$type<{qualityCertificate: boolean, testReport: boolean}>().default({qualityCertificate: false, testReport: false}),
  rawMaterialDocs: json("raw_material_docs").$type<{msds: boolean, tds: boolean, other: boolean, otherText?: string}>().default({msds: false, tds: false, other: false}),
  otherQualityRequirements: text("other_quality_requirements"),
  
  // Packaging and Format
  packagingMethod: text("packaging_method").default("roll"), // roll, sheet, other
  packagingMethodOther: text("packaging_method_other"),
  labelsPerSheet: integer("labels_per_sheet"),
  sheetsPerBundle: integer("sheets_per_bundle"),
  
  // Metadata
  description: text("description"),
  tags: json("tags").$type<string[]>().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  businessRegistrationNumber: text("business_registration_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  
  // Basic Information
  name: text("name").notNull(),
  materialCode: text("material_code"),
  category: text("category").notNull(), // 원자재, 잉크, 후가공잉크, 열박/콜드박
  type: text("type"), // PET, PP, PE, HDPE, LDPE, 아크릴, 고무 등
  subType: text("sub_type"), // 세부 분류
  description: text("description"),
  
  // Supplier Information
  primarySupplierId: integer("primary_supplier_id"),
  supplierProductCode: text("supplier_product_code"),
  alternativeSuppliers: json("alternative_suppliers").$type<Array<{supplierId: number, productCode: string, unitPrice: number}>>().default([]),
  
  // Technical Specifications
  thickness: decimal("thickness", { precision: 10, scale: 3 }), // μm
  width: decimal("width", { precision: 10, scale: 2 }), // mm
  length: decimal("length", { precision: 10, scale: 2 }), // m
  density: decimal("density", { precision: 10, scale: 3 }), // g/cm³
  tensileStrength: decimal("tensile_strength", { precision: 10, scale: 2 }), // MPa
  elongation: decimal("elongation", { precision: 10, scale: 2 }), // %
  opacity: decimal("opacity", { precision: 10, scale: 2 }), // %
  gloss: decimal("gloss", { precision: 10, scale: 2 }), // %
  
  // Color and Appearance
  color: text("color"),
  pantoneCode: text("pantone_code"),
  appearance: text("appearance"), // 투명, 반투명, 불투명
  surfaceFinish: text("surface_finish"), // 유광, 무광, 엠보싱
  
  // Adhesion Properties (for adhesive materials)
  adhesiveType: text("adhesive_type"), // 영구접착, 리무버블, 강점착, 냉동용, 고온용
  adhesionStrength: text("adhesion_strength"), // 접착력 값
  adhesionStrengthUnit: text("adhesive_strength_unit"), // N/25mm, gf/in
  initialTack: text("initial_tack"), // 초기점착력
  peelStrength: decimal("peel_strength", { precision: 10, scale: 2 }),
  
  // Temperature Resistance
  temperatureResistanceMin: integer("temperature_resistance_min"), // °C
  temperatureResistanceMax: integer("temperature_resistance_max"), // °C
  thermalStability: text("thermal_stability"),
  
  // Chemical Properties
  chemicalResistance: json("chemical_resistance").$type<{
    water: boolean,
    alcohol: boolean,
    acid: boolean,
    alkali: boolean,
    oil: boolean,
    solvent: boolean,
    other: string
  }>().default({water: false, alcohol: false, acid: false, alkali: false, oil: false, solvent: false, other: ""}),
  uvResistance: text("uv_resistance"), // 우수, 보통, 제한적
  weatherResistance: text("weather_resistance"),
  
  // Printing Properties (for inks)
  viscosity: decimal("viscosity", { precision: 10, scale: 2 }), // cP
  dryingTime: decimal("drying_time", { precision: 10, scale: 2 }), // minutes
  printingMethod: json("printing_method").$type<string[]>().default([]), // 레터프레스, 오프셋, 실크스크린, 디지털
  colorStrength: decimal("color_strength", { precision: 10, scale: 2 }),
  lightfastness: text("lightfastness"), // 1-8등급
  
  // Processing Properties
  processingTemperature: decimal("processing_temperature", { precision: 10, scale: 2 }), // °C
  processingPressure: decimal("processing_pressure", { precision: 10, scale: 2 }), // bar
  processingSpeed: decimal("processing_speed", { precision: 10, scale: 2 }), // m/min
  dieCuttingProperties: text("die_cutting_properties"),
  
  // Quality Standards
  qualityGrade: text("quality_grade"), // A급, B급, C급
  qualityStandards: json("quality_standards").$type<string[]>().default([]), // ISO, ASTM, JIS 등
  certifications: json("certifications").$type<string[]>().default([]), // FDA, CE, RoHS 등
  
  // Documentation
  msdsAvailable: boolean("msds_available").default(false),
  msdsDocument: text("msds_document"), // file path or URL
  msdsExpiryDate: date("msds_expiry_date"),
  tdsAvailable: boolean("tds_available").default(false),
  tdsDocument: text("tds_document"), // file path or URL
  tdsVersion: text("tds_version"),
  coaRequired: boolean("coa_required").default(false), // Certificate of Analysis
  
  // Storage and Handling
  storageConditions: json("storage_conditions").$type<{
    temperature: string,
    humidity: string,
    light: string,
    ventilation: string,
    other: string
  }>().default({temperature: "", humidity: "", light: "", ventilation: "", other: ""}),
  shelfLife: integer("shelf_life"), // months
  handlingPrecautions: text("handling_precautions"),
  
  // Inventory Management
  unit: text("unit").notNull(), // kg, L, m², roll, sheet
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  minimumOrderQuantity: decimal("minimum_order_quantity", { precision: 10, scale: 2 }),
  leadTime: integer("lead_time"), // days
  currentStock: decimal("current_stock", { precision: 10, scale: 2 }).default("0"),
  minimumStock: decimal("minimum_stock", { precision: 10, scale: 2 }).default("0"),
  averageConsumption: decimal("average_consumption", { precision: 10, scale: 2 }),
  
  // Environmental and Sustainability
  recyclable: boolean("recyclable").default(false),
  biodegradable: boolean("biodegradable").default(false),
  sustainabilityCertifications: json("sustainability_certifications").$type<string[]>().default([]),
  carbonFootprint: decimal("carbon_footprint", { precision: 10, scale: 3 }), // kg CO2 eq
  
  // Label Library Compatibility
  compatibleLabelTypes: json("compatible_label_types").$type<string[]>().default([]),
  recommendedApplications: json("recommended_applications").$type<string[]>().default([]),
  restrictedApplications: json("restricted_applications").$type<string[]>().default([]),
  
  // Additional Properties
  backingPaperType: text("backing_paper_type"), // 이형지 종류
  weight: text("weight"), // 중량
  
  // Additional Information
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  tags: json("tags").$type<string[]>().default([]),
  
  // Status and Metadata
  status: text("status").default("활성"), // 활성, 비활성, 단종예정, 단종
  discontinuationDate: date("discontinuation_date"),
  replacementMaterialId: integer("replacement_material_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Comprehensive Supplier Management based on Business Registration
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  
  // Business Registration Information (사업자등록증 기반)
  businessRegistrationNumber: text("business_registration_number").notNull().unique(), // 사업자등록번호
  businessName: text("business_name").notNull(), // 상호명
  businessNameEng: text("business_name_eng"), // 영문상호명
  representativeName: text("representative_name").notNull(), // 대표자명
  businessType: text("business_type"), // 업태
  businessCategory: text("business_category"), // 종목
  businessStartDate: date("business_start_date"), // 개업연월일
  
  // Address Information
  businessAddress: text("business_address").notNull(), // 본점소재지
  businessAddressEng: text("business_address_eng"), // 영문주소
  postalCode: text("postal_code"), // 우편번호
  factoryAddress: text("factory_address"), // 공장주소
  factoryAddressEng: text("factory_address_eng"), // 공장 영문주소
  
  // Contact Information
  mainPhone: text("main_phone"), // 대표전화
  mainFax: text("main_fax"), // 대표팩스
  mainEmail: text("main_email"), // 대표이메일
  website: text("website"), // 웹사이트
  
  // Business Details
  corporationType: text("corporation_type"), // 법인구분 (개인, 법인, 외국법인)
  capitalAmount: decimal("capital_amount", { precision: 15, scale: 0 }), // 자본금
  employeeCount: integer("employee_count"), // 종업원수
  establishedYear: integer("established_year"), // 설립년도
  
  // Tax and Legal Information
  taxOffice: text("tax_office"), // 관할세무서
  taxationMethod: text("taxation_method"), // 과세유형 (일반과세자, 간이과세자, 면세사업자)
  vatRegistrationNumber: text("vat_registration_number"), // 부가세등록번호
  
  // Certifications and Registrations
  businessLicense: text("business_license"), // 사업허가증
  qualityCertifications: json("quality_certifications").$type<string[]>().default([]), // ISO, KS 등
  environmentalCertifications: json("environmental_certifications").$type<string[]>().default([]), // 환경인증
  
  // Supplier Classification
  supplierType: text("supplier_type").notNull(), // 원자재공급업체, 잉크공급업체, 가공업체 등
  supplierGrade: text("supplier_grade").default("B"), // A, B, C 등급
  materialCategories: json("material_categories").$type<string[]>().default([]), // 공급가능 자재 카테고리
  
  // Business Relationship
  contractType: text("contract_type"), // 계약형태 (연간계약, 스팟계약, 장기계약)
  contractStartDate: date("contract_start_date"),
  contractEndDate: date("contract_end_date"),
  paymentTerms: text("payment_terms"), // 결제조건
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }), // 여신한도
  
  // Performance Metrics
  deliveryReliability: decimal("delivery_reliability", { precision: 5, scale: 2 }), // 납기준수율 %
  qualityRating: decimal("quality_rating", { precision: 3, scale: 2 }), // 품질평점 (1-5)
  priceCompetitiveness: decimal("price_competitiveness", { precision: 3, scale: 2 }), // 가격경쟁력
  lastEvaluationDate: date("last_evaluation_date"),
  
  // Additional Information
  bankName: text("bank_name"), // 거래은행
  bankAccount: text("bank_account"), // 계좌번호
  accountHolder: text("account_holder"), // 예금주
  
  // Status and Metadata
  approvalStatus: text("approval_status").default("검토중"), // 검토중, 승인, 반려, 일시중단
  approvalDate: date("approval_date"),
  approvedBy: integer("approved_by").references(() => users.id),
  lastAuditDate: date("last_audit_date"),
  nextAuditDate: date("next_audit_date"),
  
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Supplier Contact Management
export const supplierContacts = pgTable("supplier_contacts", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  
  // Contact Person Information
  name: text("name").notNull(),
  nameEng: text("name_eng"),
  position: text("position"), // 직책
  department: text("department"), // 부서
  
  // Contact Details
  directPhone: text("direct_phone"),
  mobilePhone: text("mobile_phone"),
  email: text("email"),
  fax: text("fax"),
  
  // Responsibilities
  responsibilities: json("responsibilities").$type<string[]>().default([]), // 영업, 기술지원, 품질관리, 납기관리
  isPrimary: boolean("is_primary").default(false), // 주 담당자 여부
  isEmergencyContact: boolean("is_emergency_contact").default(false),
  
  // Communication Preferences
  preferredContactMethod: text("preferred_contact_method"), // 전화, 이메일, 팩스
  availableHours: text("available_hours"), // 연락가능시간
  language: text("language").default("한국어"), // 사용언어
  
  // Additional Information
  birthDate: date("birth_date"),
  notes: text("notes"),
  
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// For backward compatibility, keep vendors as alias
export const vendors = suppliers;

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  projectNumber: text("project_number").notNull(),
  orderNumber: text("order_number").notNull(),
  receivedDate: date("received_date"),
  receiver: text("receiver"),
  managementCode: text("management_code"),
  customerId: integer("customer_id").references(() => customers.id),
  orderCompany: text("order_company"),
  orderPerson: text("order_person"),
  orderDepartment: text("order_department"),
  productName: text("product_name"),
  productSpecs: text("product_specs"),
  quantity: text("quantity"),
  orderFormat: text("order_format"),
  unitPrice: text("unit_price"),
  totalAmount: text("total_amount"),
  expectedDeliveryDate: date("expected_delivery_date"),
  requiredDeliveryDate: date("required_delivery_date"),
  status: text("status").default("신규"),
  assignedTo: integer("assigned_to").references(() => users.id),
  notes: text("notes"),
  isComplimentary: boolean("is_complimentary").default(false),
  labelLibraryId: integer("label_library_id").references(() => labelLibrary.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const quotations = pgTable("quotations", {
  id: serial("id").primaryKey(),
  quotationNumber: text("quotation_number").notNull(),
  orderId: integer("order_id").references(() => orders.id),
  customerId: integer("customer_id").references(() => customers.id),
  quotationDate: date("quotation_date"),
  validUntil: date("valid_until"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  status: text("status").default("초안"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const rawMaterialOrders = pgTable("raw_material_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull(),
  orderId: integer("order_id").references(() => orders.id),
  materialId: integer("material_id").references(() => materials.id),
  vendorId: integer("vendor_id").references(() => vendors.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  orderDate: date("order_date"),
  expectedDeliveryDate: date("expected_delivery_date"),
  actualDeliveryDate: date("actual_delivery_date"),
  status: text("status").default("주문"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const customerComplaints = pgTable("customer_complaints", {
  id: serial("id").primaryKey(),
  complaintNumber: text("complaint_number").notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  orderId: integer("order_id").references(() => orders.id),
  complaintType: text("complaint_type"),
  description: text("description"),
  reportedDate: date("reported_date"),
  assignedTo: integer("assigned_to").references(() => users.id),
  status: text("status").default("접수"),
  resolution: text("resolution"),
  resolvedDate: date("resolved_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const orderMaterials = pgTable("order_materials", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  materialId: integer("material_id").references(() => materials.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

export const vendorOrders = pgTable("vendor_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull(),
  orderId: integer("order_id").references(() => orders.id),
  vendorId: integer("vendor_id").references(() => vendors.id),
  orderDate: date("order_date"),
  expectedDeliveryDate: date("expected_delivery_date"),
  actualDeliveryDate: date("actual_delivery_date"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  status: text("status").default("주문"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const qualityTests = pgTable("quality_tests", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  testType: text("test_type"),
  testDate: date("test_date"),
  inspector: integer("inspector").references(() => users.id),
  testResults: json("test_results"),
  passStatus: boolean("pass_status"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  documentType: text("document_type"),
  fileName: text("file_name"),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
});

export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").references(() => materials.id),
  orderId: integer("order_id").references(() => orders.id),
  movementType: text("movement_type"),
  quantity: integer("quantity"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  remainingStock: integer("remaining_stock"),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedOrders: many(orders),
  inspectedTests: many(qualityTests),
  uploadedDocuments: many(documents),
  inventoryMovements: many(inventoryMovements),
  assignedComplaints: many(customerComplaints),
  createdLabels: many(labelLibrary)
}));

export const labelLibraryRelations = relations(labelLibrary, ({ one, many }) => ({
  creator: one(users, {
    fields: [labelLibrary.createdBy],
    references: [users.id]
  }),
  orders: many(orders)
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
  quotations: many(quotations),
  complaints: many(customerComplaints)
}));

export const materialsRelations = relations(materials, ({ one, many }) => ({
  primarySupplier: one(suppliers, {
    fields: [materials.primarySupplierId],
    references: [suppliers.id]
  }),
  replacementMaterial: one(materials, {
    fields: [materials.replacementMaterialId],
    references: [materials.id]
  }),
  creator: one(users, {
    fields: [materials.createdBy],
    references: [users.id]
  }),
  orderMaterials: many(orderMaterials),
  inventoryMovements: many(inventoryMovements),
  rawMaterialOrders: many(rawMaterialOrders)
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  creator: one(users, {
    fields: [suppliers.createdBy],
    references: [users.id]
  }),
  approver: one(users, {
    fields: [suppliers.approvedBy],
    references: [users.id]
  }),
  contacts: many(supplierContacts),
  materials: many(materials),
  vendorOrders: many(vendorOrders),
  rawMaterialOrders: many(rawMaterialOrders)
}));

export const supplierContactsRelations = relations(supplierContacts, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierContacts.supplierId],
    references: [suppliers.id]
  })
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  creator: one(users, {
    fields: [vendors.createdBy],
    references: [users.id]
  }),
  approver: one(users, {
    fields: [vendors.approvedBy],
    references: [users.id]
  }),
  contacts: many(supplierContacts),
  materials: many(materials),
  vendorOrders: many(vendorOrders),
  rawMaterialOrders: many(rawMaterialOrders)
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id]
  }),
  assignedUser: one(users, {
    fields: [orders.assignedTo],
    references: [users.id]
  }),
  labelLibrary: one(labelLibrary, {
    fields: [orders.labelLibraryId],
    references: [labelLibrary.id]
  }),
  quotations: many(quotations),
  rawMaterialOrders: many(rawMaterialOrders),
  complaints: many(customerComplaints),
  orderMaterials: many(orderMaterials),
  vendorOrders: many(vendorOrders),
  qualityTests: many(qualityTests),
  documents: many(documents),
  inventoryMovements: many(inventoryMovements)
}));

export const quotationsRelations = relations(quotations, ({ one }) => ({
  order: one(orders, {
    fields: [quotations.orderId],
    references: [orders.id]
  }),
  customer: one(customers, {
    fields: [quotations.customerId],
    references: [customers.id]
  })
}));

export const rawMaterialOrdersRelations = relations(rawMaterialOrders, ({ one }) => ({
  order: one(orders, {
    fields: [rawMaterialOrders.orderId],
    references: [orders.id]
  }),
  material: one(materials, {
    fields: [rawMaterialOrders.materialId],
    references: [materials.id]
  }),
  vendor: one(vendors, {
    fields: [rawMaterialOrders.vendorId],
    references: [vendors.id]
  })
}));

export const customerComplaintsRelations = relations(customerComplaints, ({ one }) => ({
  customer: one(customers, {
    fields: [customerComplaints.customerId],
    references: [customers.id]
  }),
  order: one(orders, {
    fields: [customerComplaints.orderId],
    references: [orders.id]
  }),
  assignedUser: one(users, {
    fields: [customerComplaints.assignedTo],
    references: [users.id]
  })
}));

export const orderMaterialsRelations = relations(orderMaterials, ({ one }) => ({
  order: one(orders, {
    fields: [orderMaterials.orderId],
    references: [orders.id]
  }),
  material: one(materials, {
    fields: [orderMaterials.materialId],
    references: [materials.id]
  })
}));

export const vendorOrdersRelations = relations(vendorOrders, ({ one }) => ({
  order: one(orders, {
    fields: [vendorOrders.orderId],
    references: [orders.id]
  }),
  vendor: one(vendors, {
    fields: [vendorOrders.vendorId],
    references: [vendors.id]
  })
}));

export const qualityTestsRelations = relations(qualityTests, ({ one }) => ({
  order: one(orders, {
    fields: [qualityTests.orderId],
    references: [orders.id]
  }),
  inspector: one(users, {
    fields: [qualityTests.inspector],
    references: [users.id]
  })
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  order: one(orders, {
    fields: [documents.orderId],
    references: [orders.id]
  }),
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id]
  })
}));

export const inventoryMovementsRelations = relations(inventoryMovements, ({ one }) => ({
  material: one(materials, {
    fields: [inventoryMovements.materialId],
    references: [materials.id]
  }),
  order: one(orders, {
    fields: [inventoryMovements.orderId],
    references: [orders.id]
  }),
  creator: one(users, {
    fields: [inventoryMovements.createdBy],
    references: [users.id]
  })
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertLabelLibrarySchema = createInsertSchema(labelLibrary).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertSupplierContactSchema = createInsertSchema(supplierContacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertQuotationSchema = createInsertSchema(quotations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertRawMaterialOrderSchema = createInsertSchema(rawMaterialOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCustomerComplaintSchema = createInsertSchema(customerComplaints).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertOrderMaterialSchema = createInsertSchema(orderMaterials).omit({
  id: true,
  createdAt: true
});

export const insertVendorOrderSchema = createInsertSchema(vendorOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertQualityTestSchema = createInsertSchema(qualityTests).omit({
  id: true,
  createdAt: true
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true
});

export const insertInventoryMovementSchema = createInsertSchema(inventoryMovements).omit({
  id: true,
  createdAt: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLabelLibrary = z.infer<typeof insertLabelLibrarySchema>;
export type LabelLibrary = typeof labelLibrary.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materials.$inferSelect;

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export type InsertSupplierContact = z.infer<typeof insertSupplierContactSchema>;
export type SupplierContact = typeof supplierContacts.$inferSelect;

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type Quotation = typeof quotations.$inferSelect;

export type InsertRawMaterialOrder = z.infer<typeof insertRawMaterialOrderSchema>;
export type RawMaterialOrder = typeof rawMaterialOrders.$inferSelect;

export type InsertCustomerComplaint = z.infer<typeof insertCustomerComplaintSchema>;
export type CustomerComplaint = typeof customerComplaints.$inferSelect;

export type InsertOrderMaterial = z.infer<typeof insertOrderMaterialSchema>;
export type OrderMaterial = typeof orderMaterials.$inferSelect;

export type InsertVendorOrder = z.infer<typeof insertVendorOrderSchema>;
export type VendorOrder = typeof vendorOrders.$inferSelect;

export type InsertQualityTest = z.infer<typeof insertQualityTestSchema>;
export type QualityTest = typeof qualityTests.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;
export type InventoryMovement = typeof inventoryMovements.$inferSelect;