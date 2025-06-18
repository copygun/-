import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderStats } from "@/components/orders/order-stats";
import { OrderFilters } from "@/components/orders/order-filters";
import { OrderTable } from "@/components/orders/order-table";
import { OrderDetailModal } from "@/components/orders/order-detail-modal";
import { OrderFormModal } from "@/components/orders/order-form-modal";
import type { Order, Customer, User } from "@shared/schema";

interface OrderWithRelations extends Order {
  customer: Customer | null;
  assignedUser: User | null;
}

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    customerId: "all",
    dateFrom: "",
    dateTo: "",
    search: "",
  });

  const { data: orders, isLoading } = useQuery<OrderWithRelations[]>({
    queryKey: ["/api/orders", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") params.append(key, value);
      });
      
      const response = await fetch(`/api/orders?${params}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

  const handleOrderClick = (order: OrderWithRelations) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({ ...prev, search: value }));
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-inter">주문 접수 관리</h2>
            <p className="text-sm text-gray-600 mt-1">고객사 주문을 접수하고 관리합니다</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="주문번호, 고객사명 검색..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-64"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative bg-[#114580]">
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>

            {/* New Order Button */}
            <Button 
              onClick={() => setFormModalOpen(true)}
              className="bg-[#242222] hover:bg-primary-600 text-white flex items-center space-x-2"
            >
              <i className="fas fa-plus"></i>
              <span className="text-[#0e1525] bg-[#290000]">신규 주문</span>
            </Button>
          </div>
        </div>
      </header>
      {/* Content */}
      <div className="p-6">
        {/* Stats */}
        <OrderStats />

        {/* Filters */}
        <OrderFilters filters={filters} onFiltersChange={setFilters} />

        {/* Orders Table */}
        <OrderTable 
          orders={orders || []} 
          onOrderClick={handleOrderClick} 
          isLoading={isLoading}
        />
      </div>
      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
      {/* Order Form Modal */}
      <OrderFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
      />
    </div>
  );
}
