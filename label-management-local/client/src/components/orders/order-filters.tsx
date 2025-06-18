import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Customer } from "@shared/schema";

interface OrderFiltersProps {
  filters: {
    status: string;
    customerId: string;
    dateFrom: string;
    dateTo: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function OrderFilters({ filters, onFiltersChange }: OrderFiltersProps) {
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <div className="min-w-[160px]">
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="전체 상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="pending">접수 대기</SelectItem>
                  <SelectItem value="processing">진행 중</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="cancelled">취소</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="w-auto"
              />
              <span className="text-gray-500">~</span>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="w-auto"
              />
            </div>

            {/* Customer Filter */}
            <div className="min-w-[180px]">
              <Select value={filters.customerId} onValueChange={(value) => handleFilterChange("customerId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="전체 고객사" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 고객사</SelectItem>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="min-w-[200px]">
              <Input
                placeholder="주문번호, 제품명 검색..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" className="flex items-center space-x-2">
              <i className="fas fa-download"></i>
              <span>엑셀 다운로드</span>
            </Button>
            <Button variant="outline" size="icon" className="bg-[#3c445c]">
              <i className="fas fa-filter"></i>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
