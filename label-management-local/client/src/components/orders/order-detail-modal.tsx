import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency, getStatusColor, getStatusText } from "@/lib/utils";
import type { Order, Customer, User } from "@shared/schema";

interface OrderWithRelations extends Order {
  customer: Customer | null;
  assignedUser: User | null;
}

interface OrderDetailModalProps {
  order: OrderWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailModal({ order, open, onOpenChange }: OrderDetailModalProps) {
  if (!order) return null;

  const statusInfo = getStatusColor(order.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">주문 상세정보</h3>
              <p className="text-sm text-gray-600 mt-1">
                {order.orderNumber} | {order.customer?.name}
              </p>
            </div>
            <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border-0`}>
              <i className={`${statusInfo.icon} mr-1.5`}></i>
              {getStatusText(order.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          {/* Left Column - Order Info */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">기본 정보</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">주문번호:</span>
                  <span className="font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">주문일:</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">납기일:</span>
                  <span className="font-medium">{formatDate(order.dueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">담당자:</span>
                  <span className="font-medium">{order.assignedUser?.name || "미지정"}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">고객 정보</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">회사명:</span>
                  <span className="font-medium">{order.customer?.name || "알 수 없음"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">담당자:</span>
                  <span className="font-medium">{order.customer?.contactPerson || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">연락처:</span>
                  <span className="font-medium">{order.customer?.phone || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">이메일:</span>
                  <span className="font-medium">{order.customer?.email || "-"}</span>
                </div>
              </div>
            </div>

            {/* Material Specifications */}
            {order.materialSpecs && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">원자재 스펙</h4>
                <div className="space-y-2">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(order.materialSpecs, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Product & Quality */}
          <div className="space-y-6">
            {/* Product Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">제품 정보</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">제품명:</span>
                  <span className="font-medium">{order.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">사양:</span>
                  <span className="font-medium">{order.productSpecs || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">수량:</span>
                  <span className="font-medium">{order.quantity?.toLocaleString()}매</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">단가:</span>
                  <span className="font-medium">{formatCurrency(order.unitPrice)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600 font-semibold">총 금액:</span>
                  <span className="font-bold text-lg">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Quality Requirements */}
            {order.qualityRequirements && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">품질 요구사항</h4>
                <div className="space-y-2">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(order.qualityRequirements, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">메모</h4>
                <p className="text-sm text-gray-700">{order.notes}</p>
              </div>
            )}

            {/* Production Status - Mock data for now */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">진행 상황</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <i className="fas fa-check text-white text-sm"></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">주문 접수</p>
                    <p className="text-sm text-gray-600">{formatDate(order.createdAt)} 완료</p>
                  </div>
                </div>
                {order.status === "processing" && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                      <i className="fas fa-hourglass-half text-white text-sm"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">생산 진행</p>
                      <p className="text-sm text-gray-600">진행 중</p>
                    </div>
                  </div>
                )}
                {order.status === "completed" && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <i className="fas fa-check text-white text-sm"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">생산 완료</p>
                      <p className="text-sm text-gray-600">완료</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2">
            <i className="fas fa-file-alt"></i>
            <span>성적서 생성</span>
          </Button>
          <Button className="bg-primary-500 hover:bg-primary-600 text-white flex items-center space-x-2">
            <i className="fas fa-edit"></i>
            <span>수정</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
