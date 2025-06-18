import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertOrderSchema, insertCustomerSchema, insertMaterialSchema, insertVendorSchema,
  insertSupplierSchema, insertSupplierContactSchema, insertLabelLibrarySchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Label Library routes
  app.get("/api/label-library", async (req, res) => {
    try {
      const { search, labelTypes, printMethods, tags } = req.query;
      
      const filters: any = {};
      if (search) filters.search = search as string;
      if (labelTypes) filters.labelTypes = (labelTypes as string).split(',');
      if (printMethods) filters.printMethods = (printMethods as string).split(',');
      if (tags) filters.tags = (tags as string).split(',');

      const labelLibrary = await storage.getLabelLibrary(filters);
      res.json(labelLibrary);
    } catch (error) {
      console.error("Failed to fetch label library:", error);
      res.status(500).json({ message: "Failed to fetch label library" });
    }
  });

  app.get("/api/label-library/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getLabelLibraryItem(id);
      if (!item) {
        return res.status(404).json({ message: "Label library item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Failed to fetch label library item:", error);
      res.status(500).json({ message: "Failed to fetch label library item" });
    }
  });

  app.post("/api/label-library", async (req, res) => {
    try {
      const item = await storage.createLabelLibraryItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error("Failed to create label library item:", error);
      res.status(500).json({ message: "Failed to create label library item" });
    }
  });

  app.put("/api/label-library/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.updateLabelLibraryItem(id, req.body);
      res.json(item);
    } catch (error) {
      console.error("Failed to update label library item:", error);
      res.status(500).json({ message: "Failed to update label library item" });
    }
  });

  app.delete("/api/label-library/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLabelLibraryItem(id);
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete label library item:", error);
      res.status(500).json({ message: "Failed to delete label library item" });
    }
  });

  app.post("/api/label-library/:id/duplicate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { newName } = req.body;
      const duplicated = await storage.duplicateLabelLibraryItem(id, newName);
      res.status(201).json(duplicated);
    } catch (error) {
      console.error("Failed to duplicate label library item:", error);
      res.status(500).json({ message: "Failed to duplicate label library item" });
    }
  });

  // Order statistics - must come before parameterized routes
  app.get("/api/orders/stats", async (req, res) => {
    try {
      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      console.error("Failed to fetch order stats:", error);
      res.status(500).json({ message: "Failed to fetch order stats" });
    }
  });

  // Orders routes
  app.get("/api/orders", async (req, res) => {
    try {
      const { status, customerId, assignedTo, dateFrom, dateTo, search } = req.query;
      
      const filters: any = {};
      if (status) filters.status = status as string;
      if (customerId) filters.customerId = parseInt(customerId as string);
      if (assignedTo) filters.assignedTo = parseInt(assignedTo as string);
      if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
      if (dateTo) filters.dateTo = new Date(dateTo as string);
      if (search) filters.search = search as string;

      const orders = await storage.getOrders(filters);
      res.json(orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Generate order number if not provided
      if (!orderData.orderNumber) {
        orderData.orderNumber = await storage.generateOrderNumber();
      }

      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      console.error("Failed to create order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const order = await storage.updateOrder(id, updateData);
      res.json(order);
    } catch (error) {
      console.error("Failed to update order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteOrder(id);
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete order:", error);
      res.status(500).json({ message: "Failed to delete order" });
    }
  });



  // Users routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Customers routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      console.error("Failed to create customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.patch("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const customer = await storage.updateCustomer(id, updateData);
      res.json(customer);
    } catch (error) {
      console.error("Failed to update customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomer(id);
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Materials Library Routes
  app.get("/api/materials", async (req, res) => {
    try {
      const { search, category, type, supplierId, status, tags } = req.query;
      
      const filters: any = {};
      if (search) filters.search = search as string;
      if (category) filters.category = category as string;
      if (type) filters.type = type as string;
      if (supplierId) filters.supplierId = parseInt(supplierId as string);
      if (status) filters.status = status as string;
      if (tags) filters.tags = (tags as string).split(',');

      const materials = await storage.getMaterials(filters);
      res.json(materials);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
      res.status(500).json({ message: "Failed to fetch materials" });
    }
  });

  app.get("/api/materials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const material = await storage.getMaterial(id);
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      res.json(material);
    } catch (error) {
      console.error("Failed to fetch material:", error);
      res.status(500).json({ message: "Failed to fetch material" });
    }
  });

  app.post("/api/materials", async (req, res) => {
    try {
      const materialData = insertMaterialSchema.parse(req.body);
      const material = await storage.createMaterial(materialData);
      res.status(201).json(material);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid material data", errors: error.errors });
      }
      console.error("Failed to create material:", error);
      res.status(500).json({ message: "Failed to create material" });
    }
  });

  app.patch("/api/materials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const material = await storage.updateMaterial(id, updateData);
      res.json(material);
    } catch (error) {
      console.error("Failed to update material:", error);
      res.status(500).json({ message: "Failed to update material" });
    }
  });

  app.delete("/api/materials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMaterial(id);
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete material:", error);
      res.status(500).json({ message: "Failed to delete material" });
    }
  });

  app.post("/api/materials/search-by-specification", async (req, res) => {
    try {
      const specs = req.body;
      const materials = await storage.searchMaterialsBySpecification(specs);
      res.json(materials);
    } catch (error) {
      console.error("Failed to search materials by specification:", error);
      res.status(500).json({ message: "Failed to search materials by specification" });
    }
  });

  // Supplier Management Routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const { search, supplierType, supplierGrade, approvalStatus, materialCategories } = req.query;
      
      const filters: any = {};
      if (search) filters.search = search as string;
      if (supplierType) filters.supplierType = supplierType as string;
      if (supplierGrade) filters.supplierGrade = supplierGrade as string;
      if (approvalStatus) filters.approvalStatus = approvalStatus as string;
      if (materialCategories) filters.materialCategories = (materialCategories as string).split(',');

      const suppliers = await storage.getSuppliers(filters);
      res.json(suppliers);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supplier = await storage.getSupplier(id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      console.error("Failed to fetch supplier:", error);
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      console.error("Failed to create supplier:", error);
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  app.patch("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const supplier = await storage.updateSupplier(id, updateData);
      res.json(supplier);
    } catch (error) {
      console.error("Failed to update supplier:", error);
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSupplier(id);
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete supplier:", error);
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  app.post("/api/suppliers/:id/approve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { approvedBy } = req.body;
      const supplier = await storage.approveSupplier(id, approvedBy);
      res.json(supplier);
    } catch (error) {
      console.error("Failed to approve supplier:", error);
      res.status(500).json({ message: "Failed to approve supplier" });
    }
  });

  // Supplier Contacts Routes
  app.get("/api/suppliers/:supplierId/contacts", async (req, res) => {
    try {
      const supplierId = parseInt(req.params.supplierId);
      const contacts = await storage.getSupplierContacts(supplierId);
      res.json(contacts);
    } catch (error) {
      console.error("Failed to fetch supplier contacts:", error);
      res.status(500).json({ message: "Failed to fetch supplier contacts" });
    }
  });

  app.post("/api/suppliers/:supplierId/contacts", async (req, res) => {
    try {
      const supplierId = parseInt(req.params.supplierId);
      const contactData = insertSupplierContactSchema.parse({
        ...req.body,
        supplierId
      });
      const contact = await storage.createSupplierContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      console.error("Failed to create supplier contact:", error);
      res.status(500).json({ message: "Failed to create supplier contact" });
    }
  });

  app.patch("/api/supplier-contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const contact = await storage.updateSupplierContact(id, updateData);
      res.json(contact);
    } catch (error) {
      console.error("Failed to update supplier contact:", error);
      res.status(500).json({ message: "Failed to update supplier contact" });
    }
  });

  app.delete("/api/supplier-contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSupplierContact(id);
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete supplier contact:", error);
      res.status(500).json({ message: "Failed to delete supplier contact" });
    }
  });

  // Vendors routes
  app.get("/api/vendors", async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.post("/api/vendors", async (req, res) => {
    try {
      const vendorData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(vendorData);
      res.status(201).json(vendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vendor data", errors: error.errors });
      }
      console.error("Failed to create vendor:", error);
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });

  // Quality tests routes
  app.get("/api/orders/:orderId/quality-tests", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const tests = await storage.getQualityTests(orderId);
      res.json(tests);
    } catch (error) {
      console.error("Failed to fetch quality tests:", error);
      res.status(500).json({ message: "Failed to fetch quality tests" });
    }
  });

  // Documents routes
  app.get("/api/orders/:orderId/documents", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const documents = await storage.getDocuments(orderId);
      res.json(documents);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Reports routes
  app.get("/api/reports", async (req, res) => {
    try {
      const { reportType = "overview", dateFrom, dateTo } = req.query;
      const filters = {
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
      };
      const reportData = await storage.getReportData(reportType as string, filters);
      res.json(reportData);
    } catch (error) {
      console.error("Failed to generate report data:", error);
      res.status(500).json({ message: "Failed to generate report data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
