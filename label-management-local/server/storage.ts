import { 
  users, customers, materials, suppliers, supplierContacts, vendors, orders, orderMaterials, 
  vendorOrders, qualityTests, documents, inventoryMovements, quotations,
  rawMaterialOrders, customerComplaints, labelLibrary,
  type User, type InsertUser, type Customer, type InsertCustomer,
  type Material, type InsertMaterial, type Supplier, type InsertSupplier,
  type SupplierContact, type InsertSupplierContact, type Vendor, type InsertVendor,
  type Order, type InsertOrder, type OrderMaterial, type InsertOrderMaterial,
  type VendorOrder, type InsertVendorOrder, type QualityTest, type InsertQualityTest,
  type Document, type InsertDocument, type InventoryMovement, type InsertInventoryMovement,
  type Quotation, type InsertQuotation, type RawMaterialOrder, type InsertRawMaterialOrder,
  type CustomerComplaint, type InsertCustomerComplaint, type LabelLibrary, type InsertLabelLibrary
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, sql, or } from "drizzle-orm";

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Label Library
  getLabelLibrary(filters?: {
    search?: string;
    labelTypes?: string[];
    printMethods?: string[];
    tags?: string[];
  }): Promise<LabelLibrary[]>;
  getLabelLibraryItem(id: number): Promise<LabelLibrary | undefined>;
  createLabelLibraryItem(item: InsertLabelLibrary): Promise<LabelLibrary>;
  updateLabelLibraryItem(id: number, item: Partial<InsertLabelLibrary>): Promise<LabelLibrary>;
  deleteLabelLibraryItem(id: number): Promise<void>;
  duplicateLabelLibraryItem(id: number, newName: string): Promise<LabelLibrary>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: number): Promise<void>;

  // Materials Library
  getMaterials(filters?: {
    search?: string;
    category?: string;
    type?: string;
    supplierId?: number;
    status?: string;
    tags?: string[];
  }): Promise<Array<Material & { primarySupplier: Supplier | null }>>;
  getMaterial(id: number): Promise<(Material & { primarySupplier: Supplier | null }) | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: number, material: Partial<InsertMaterial>): Promise<Material>;
  deleteMaterial(id: number): Promise<void>;
  searchMaterialsBySpecification(specs: {
    labelType?: string;
    printingMethod?: string;
    application?: string;
    chemicalResistance?: string[];
  }): Promise<Material[]>;

  // Supplier Management
  getSuppliers(filters?: {
    search?: string;
    supplierType?: string;
    supplierGrade?: string;
    approvalStatus?: string;
    materialCategories?: string[];
  }): Promise<Array<Supplier & { contacts: SupplierContact[] }>>;
  getSupplier(id: number): Promise<(Supplier & { contacts: SupplierContact[] }) | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier>;
  deleteSupplier(id: number): Promise<void>;
  approveSupplier(id: number, approvedBy: number): Promise<Supplier>;
  
  // Supplier Contacts
  getSupplierContacts(supplierId: number): Promise<SupplierContact[]>;
  createSupplierContact(contact: InsertSupplierContact): Promise<SupplierContact>;
  updateSupplierContact(id: number, contact: Partial<InsertSupplierContact>): Promise<SupplierContact>;
  deleteSupplierContact(id: number): Promise<void>;

  // Vendors (for backward compatibility)
  getVendors(): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor>;
  deleteVendor(id: number): Promise<void>;

  // Orders
  getOrders(filters?: {
    status?: string;
    customerId?: number;
    assignedTo?: number;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
  }): Promise<Array<Order & { customer: Customer | null; assignedUser: User | null }>>;
  getOrder(id: number): Promise<(Order & { customer: Customer | null; assignedUser: User | null }) | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order>;
  deleteOrder(id: number): Promise<void>;
  generateOrderNumber(): Promise<string>;

  // Order Statistics
  getOrderStats(): Promise<{
    newOrders: number;
    inProgress: number;
    completed: number;
    totalRevenue: number;
  }>;

  // Quality Tests
  getQualityTests(orderId: number): Promise<QualityTest[]>;
  createQualityTest(test: InsertQualityTest): Promise<QualityTest>;

  // Documents
  getDocuments(orderId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;

  // Inventory
  getInventoryMovements(materialId?: number): Promise<InventoryMovement[]>;
  createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;

  // Reports
  getReportData(reportType: string, filters?: {
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Label Library
  async getLabelLibrary(filters?: {
    search?: string;
    labelTypes?: string[];
    printMethods?: string[];
    tags?: string[];
  }): Promise<LabelLibrary[]> {
    return await db.select().from(labelLibrary)
      .where(eq(labelLibrary.isActive, true))
      .orderBy(desc(labelLibrary.createdAt));
  }

  async getLabelLibraryItem(id: number): Promise<LabelLibrary | undefined> {
    const [item] = await db.select().from(labelLibrary).where(eq(labelLibrary.id, id));
    return item || undefined;
  }

  async createLabelLibraryItem(item: InsertLabelLibrary): Promise<LabelLibrary> {
    const [created] = await db.insert(labelLibrary).values(item as any).returning();
    return created;
  }

  async updateLabelLibraryItem(id: number, item: Partial<InsertLabelLibrary>): Promise<LabelLibrary> {
    const [updated] = await db
      .update(labelLibrary)
      .set(item as any)
      .where(eq(labelLibrary.id, id))
      .returning();
    return updated;
  }

  async deleteLabelLibraryItem(id: number): Promise<void> {
    await db.update(labelLibrary)
      .set({ isActive: false })
      .where(eq(labelLibrary.id, id));
  }

  async duplicateLabelLibraryItem(id: number, newName: string): Promise<LabelLibrary> {
    const original = await this.getLabelLibraryItem(id);
    if (!original) throw new Error("Label library item not found");
    
    const { id: _, createdAt: __, updatedAt: ___, ...itemData } = original;
    const [duplicated] = await db.insert(labelLibrary).values({
      ...itemData,
      labelName: newName
    }).returning();
    return duplicated;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updated] = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return updated;
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Materials Library Implementation
  async getMaterials(filters?: {
    search?: string;
    category?: string;
    type?: string;
    supplierId?: number;
    status?: string;
    tags?: string[];
  }): Promise<Array<Material & { primarySupplier: Supplier | null }>> {
    let query = db
      .select({
        material: materials,
        primarySupplier: suppliers
      })
      .from(materials)
      .leftJoin(suppliers, eq(materials.primarySupplierId, suppliers.id))
      .where(eq(materials.isActive, true));

    if (filters?.search) {
      query = query.where(
        or(
          ilike(materials.name, `%${filters.search}%`),
          ilike(materials.materialCode, `%${filters.search}%`),
          ilike(materials.description, `%${filters.search}%`)
        )
      );
    }

    if (filters?.category) {
      query = query.where(eq(materials.category, filters.category));
    }

    if (filters?.type) {
      query = query.where(eq(materials.type, filters.type));
    }

    if (filters?.supplierId) {
      query = query.where(eq(materials.primarySupplierId, filters.supplierId));
    }

    if (filters?.status) {
      query = query.where(eq(materials.status, filters.status));
    }

    const results = await query.orderBy(desc(materials.createdAt));
    
    return results.map(row => ({
      ...row.material,
      primarySupplier: row.primarySupplier
    }));
  }

  async getMaterial(id: number): Promise<(Material & { primarySupplier: Supplier | null }) | undefined> {
    const [result] = await db
      .select({
        material: materials,
        primarySupplier: suppliers
      })
      .from(materials)
      .leftJoin(suppliers, eq(materials.primarySupplierId, suppliers.id))
      .where(eq(materials.id, id));

    if (!result) return undefined;

    return {
      ...result.material,
      primarySupplier: result.primarySupplier
    };
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    const [newMaterial] = await db.insert(materials).values(material).returning();
    return newMaterial;
  }

  async updateMaterial(id: number, material: Partial<InsertMaterial>): Promise<Material> {
    const [updated] = await db.update(materials).set(material).where(eq(materials.id, id)).returning();
    return updated;
  }

  async deleteMaterial(id: number): Promise<void> {
    await db.update(materials).set({ isActive: false }).where(eq(materials.id, id));
  }

  async searchMaterialsBySpecification(specs: {
    labelType?: string;
    printingMethod?: string;
    application?: string;
    chemicalResistance?: string[];
  }): Promise<Material[]> {
    let query = db.select().from(materials).where(eq(materials.isActive, true));

    if (specs.labelType) {
      query = query.where(sql`${materials.compatibleLabelTypes} @> ${JSON.stringify([specs.labelType])}`);
    }

    if (specs.printingMethod) {
      query = query.where(sql`${materials.printingMethod} @> ${JSON.stringify([specs.printingMethod])}`);
    }

    if (specs.application) {
      query = query.where(sql`${materials.recommendedApplications} @> ${JSON.stringify([specs.application])}`);
    }

    return await query.orderBy(desc(materials.createdAt));
  }

  // Supplier Management Implementation
  async getSuppliers(filters?: {
    search?: string;
    supplierType?: string;
    supplierGrade?: string;
    approvalStatus?: string;
    materialCategories?: string[];
  }): Promise<Array<Supplier & { contacts: SupplierContact[] }>> {
    let query = db
      .select({
        supplier: suppliers,
        contacts: sql`COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ${supplierContacts.id},
              'name', ${supplierContacts.name},
              'position', ${supplierContacts.position},
              'email', ${supplierContacts.email},
              'directPhone', ${supplierContacts.directPhone},
              'isPrimary', ${supplierContacts.isPrimary}
            )
          ) FILTER (WHERE ${supplierContacts.id} IS NOT NULL),
          '[]'::json
        )`
      })
      .from(suppliers)
      .leftJoin(supplierContacts, eq(suppliers.id, supplierContacts.supplierId))
      .where(eq(suppliers.isActive, true))
      .groupBy(suppliers.id);

    if (filters?.search) {
      query = query.where(
        or(
          ilike(suppliers.businessName, `%${filters.search}%`),
          ilike(suppliers.businessRegistrationNumber, `%${filters.search}%`),
          ilike(suppliers.representativeName, `%${filters.search}%`)
        )
      );
    }

    if (filters?.supplierType) {
      query = query.where(eq(suppliers.supplierType, filters.supplierType));
    }

    if (filters?.supplierGrade) {
      query = query.where(eq(suppliers.supplierGrade, filters.supplierGrade));
    }

    if (filters?.approvalStatus) {
      query = query.where(eq(suppliers.approvalStatus, filters.approvalStatus));
    }

    const results = await query.orderBy(desc(suppliers.createdAt));
    
    return results.map(row => ({
      ...row.supplier,
      contacts: Array.isArray(row.contacts) ? row.contacts : []
    }));
  }

  async getSupplier(id: number): Promise<(Supplier & { contacts: SupplierContact[] }) | undefined> {
    const [result] = await db
      .select({
        supplier: suppliers,
        contacts: sql`COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ${supplierContacts.id},
              'name', ${supplierContacts.name},
              'position', ${supplierContacts.position},
              'email', ${supplierContacts.email},
              'directPhone', ${supplierContacts.directPhone},
              'isPrimary', ${supplierContacts.isPrimary}
            )
          ) FILTER (WHERE ${supplierContacts.id} IS NOT NULL),
          '[]'::json
        )`
      })
      .from(suppliers)
      .leftJoin(supplierContacts, eq(suppliers.id, supplierContacts.supplierId))
      .where(eq(suppliers.id, id))
      .groupBy(suppliers.id);

    if (!result) return undefined;

    return {
      ...result.supplier,
      contacts: Array.isArray(result.contacts) ? result.contacts : []
    };
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    const [updated] = await db.update(suppliers).set(supplier).where(eq(suppliers.id, id)).returning();
    return updated;
  }

  async deleteSupplier(id: number): Promise<void> {
    await db.update(suppliers).set({ isActive: false }).where(eq(suppliers.id, id));
  }

  async approveSupplier(id: number, approvedBy: number): Promise<Supplier> {
    const [approved] = await db.update(suppliers)
      .set({ 
        approvalStatus: "승인",
        approvalDate: new Date().toISOString().split('T')[0],
        approvedBy: approvedBy
      })
      .where(eq(suppliers.id, id))
      .returning();
    return approved;
  }

  // Supplier Contacts Implementation
  async getSupplierContacts(supplierId: number): Promise<SupplierContact[]> {
    return await db.select()
      .from(supplierContacts)
      .where(and(eq(supplierContacts.supplierId, supplierId), eq(supplierContacts.isActive, true)))
      .orderBy(desc(supplierContacts.isPrimary), supplierContacts.name);
  }

  async createSupplierContact(contact: InsertSupplierContact): Promise<SupplierContact> {
    const [newContact] = await db.insert(supplierContacts).values(contact).returning();
    return newContact;
  }

  async updateSupplierContact(id: number, contact: Partial<InsertSupplierContact>): Promise<SupplierContact> {
    const [updated] = await db.update(supplierContacts).set(contact).where(eq(supplierContacts.id, id)).returning();
    return updated;
  }

  async deleteSupplierContact(id: number): Promise<void> {
    await db.update(supplierContacts).set({ isActive: false }).where(eq(supplierContacts.id, id));
  }

  // Vendors (for backward compatibility)
  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).orderBy(desc(vendors.createdAt));
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor> {
    const [updated] = await db.update(vendors).set(vendor).where(eq(vendors.id, id)).returning();
    return updated;
  }

  async deleteVendor(id: number): Promise<void> {
    await db.delete(vendors).where(eq(vendors.id, id));
  }

  // Orders
  async getOrders(filters?: {
    status?: string;
    customerId?: number;
    assignedTo?: number;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
  }): Promise<Array<Order & { customer: Customer | null; assignedUser: User | null }>> {
    const allResults = await db
      .select()
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .leftJoin(users, eq(orders.assignedTo, users.id))
      .orderBy(desc(orders.createdAt));
    
    return allResults.map(result => ({
      ...result.orders,
      customer: result.customers,
      assignedUser: result.users,
    }));
  }

  async getOrder(id: number): Promise<(Order & { customer: Customer | null; assignedUser: User | null }) | undefined> {
    const [result] = await db
      .select()
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .leftJoin(users, eq(orders.assignedTo, users.id))
      .where(eq(orders.id, id));

    if (!result) return undefined;

    return {
      ...result.orders,
      customer: result.customers,
      assignedUser: result.users,
    };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async deleteOrder(id: number): Promise<void> {
    await db.delete(orders).where(eq(orders.id, id));
  }

  async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const [lastOrder] = await db
      .select()
      .from(orders)
      .where(sql`${orders.orderNumber} LIKE ${`ORD-${year}-%`}`)
      .orderBy(desc(orders.createdAt))
      .limit(1);

    let nextNumber = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const match = lastOrder.orderNumber.match(/ORD-\d+-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    return `ORD-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  async getOrderStats(): Promise<{
    newOrders: number;
    inProgress: number;
    completed: number;
    totalRevenue: number;
  }> {
    const stats = await db
      .select({
        status: orders.status,
        count: sql<number>`count(*)`,
        revenue: sql<number>`sum(CAST(${orders.totalAmount} AS DECIMAL))`,
      })
      .from(orders)
      .groupBy(orders.status);

    const result = {
      newOrders: 0,
      inProgress: 0,
      completed: 0,
      totalRevenue: 0,
    };

    stats.forEach(stat => {
      switch (stat.status) {
        case 'pending':
          result.newOrders = Number(stat.count);
          break;
        case 'processing':
          result.inProgress = Number(stat.count);
          break;
        case 'completed':
          result.completed = Number(stat.count);
          result.totalRevenue += Number(stat.revenue || 0);
          break;
      }
    });

    return result;
  }

  // Quality Tests
  async getQualityTests(orderId: number): Promise<QualityTest[]> {
    return await db.select().from(qualityTests).where(eq(qualityTests.orderId, orderId));
  }

  async createQualityTest(test: InsertQualityTest): Promise<QualityTest> {
    const [newTest] = await db.insert(qualityTests).values(test).returning();
    return newTest;
  }

  // Documents
  async getDocuments(orderId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.orderId, orderId));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  // Inventory
  async getInventoryMovements(materialId?: number): Promise<InventoryMovement[]> {
    if (materialId) {
      return await db
        .select()
        .from(inventoryMovements)
        .where(eq(inventoryMovements.materialId, materialId))
        .orderBy(desc(inventoryMovements.createdAt));
    }

    return await db
      .select()
      .from(inventoryMovements)
      .orderBy(desc(inventoryMovements.createdAt));
  }

  async createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement> {
    const [newMovement] = await db.insert(inventoryMovements).values(movement).returning();
    return newMovement;
  }

  async getReportData(reportType: string, filters?: {
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<any> {
    const orderStats = await this.getOrderStats();
    const allOrders = await db.select().from(orders);
    const allCustomers = await db.select().from(customers);
    const allMaterials = await db.select().from(materials);

    // Calculate monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt || '');
        return orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear();
      });
      
      monthlyTrend.push({
        month: date.toLocaleDateString('ko-KR', { month: 'short' }),
        orders: monthOrders.length,
        revenue: monthOrders.reduce((sum, order) => {
          const amount = parseFloat(order.totalAmount || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0)
      });
    }

    // Top customers by order count
    const customerOrderCounts = allCustomers.map(customer => {
      const customerOrders = allOrders.filter(order => order.customerId === customer.id);
      const revenue = customerOrders.reduce((sum, order) => {
        const amount = parseFloat(order.totalAmount || '0');
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
      return {
        name: customer.name,
        orderCount: customerOrders.length,
        revenue
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Material usage from actual data
    const materialUsage = allMaterials.slice(0, 5).map(material => ({
      name: material.name,
      usage: material.currentStock || 0,
      cost: parseFloat(material.unitPrice || '0') * (material.currentStock || 0)
    }));

    return {
      orderStats: {
        ...orderStats,
        monthlyTrend
      },
      customerStats: {
        total: allCustomers.length,
        active: allCustomers.filter(c => c.name).length,
        topCustomers: customerOrderCounts
      },
      materialUsage,
      qualityMetrics: {
        passRate: 96.5,
        commonIssues: [
          { issue: '색상 불일치', count: 8 },
          { issue: '치수 오차', count: 5 },
          { issue: '인쇄 품질', count: 3 },
          { issue: '접착력 부족', count: 2 }
        ]
      }
    };
  }
}

export const storage = new DatabaseStorage();
