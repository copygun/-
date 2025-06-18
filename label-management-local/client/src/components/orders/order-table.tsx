import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency, calculateDaysUntil, getStatusColor, getStatusText } from "@/lib/utils";
import type { Order, Customer, User } from "@shared/schema";

interface OrderWithRelations extends Order {
  customer: Customer | null;
  assignedUser: User | null;
}

interface OrderTableProps {
  orders: OrderWithRelations[];
  onOrderClick: (order: OrderWithRelations) => void;
  isLoading?: boolean;
}

export function OrderTable({ orders, onOrderClick, isLoading }: OrderTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">주문 목록</h3>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">주문 목록</h3>
        </div>
        <div className="p-8 text-center">
          <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">등록된 주문이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">주문 목록</h3>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead>프로젝트번호</TableHead>
              <TableHead>접수일</TableHead>
              <TableHead>고객사</TableHead>
              <TableHead>제품명</TableHead>
              <TableHead>수량</TableHead>
              <TableHead>예상납기일</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>담당자</TableHead>
              <TableHead>액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const dueStatus = calculateDaysUntil(order.expectedDeliveryDate || order.requiredDeliveryDate);
              const statusInfo = getStatusColor(order.status);

              return (
                <TableRow key={order.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <div>
                      <button
                        onClick={() => onOrderClick(order)}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 cursor-pointer"
                      >
                        {order.projectNumber || order.orderNumber}
                      </button>
                      <div className="text-xs text-gray-500">{order.managementCode}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{formatDate(order.receivedDate)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <i className="fas fa-building text-purple-600 text-sm"></i>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer?.name || order.orderCompany || "알 수 없음"}
                        </div>
                        <div className="text-xs text-gray-500">{order.orderPerson}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.productName}</div>
                      <div className="text-xs text-gray-500">{order.orderFormat}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.quantity?.toLocaleString()}매
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm text-gray-900">{formatDate(order.expectedDeliveryDate || order.requiredDeliveryDate)}</div>
                      <div
                        className={`text-xs ${
                          dueStatus.status === "overdue"
                            ? "text-red-600"
                            : dueStatus.status === "urgent"
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        <i
                          className={`mr-1 ${
                            dueStatus.status === "overdue"
                              ? "fas fa-exclamation-triangle"
                              : dueStatus.status === "urgent"
                              ? "fas fa-clock"
                              : "fas fa-check"
                          }`}
                        ></i>
                        {dueStatus.text}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border-0`}>
                      <i className={`${statusInfo.icon} mr-1.5`}></i>
                      {getStatusText(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs text-white font-medium">
                          {order.assignedUser?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">
                        {order.assignedUser?.name || "미지정"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOrderClick(order)}
                        className="text-primary-600 hover:text-primary-700"
                        title="상세보기"
                      >
                        <i className="fas fa-eye"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-700"
                        title="편집"
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                        title="문서생성"
                      >
                        <i className="fas fa-file-alt"></i>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            총 <span className="font-medium">{orders.length}</span>개 중{" "}
            <span className="font-medium">1-{orders.length}</span>개 표시
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            이전
          </Button>
          <Button variant="default" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm">
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
