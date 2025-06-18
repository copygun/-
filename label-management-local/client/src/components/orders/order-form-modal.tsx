import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Customer, User } from "@shared/schema";

interface OrderFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OrderFormData {
  projectNumber: string;
  orderNumber: string;
  receivedDate: string;
  receiver: string;
  managementCode: string;
  customerId: string;
  orderCompany: string;
  orderPerson: string;
  orderDepartment: string;
  productName: string;
  productSpecs: string;
  quantity: string;
  orderFormat: string;
  unitPrice: string;
  totalAmount: string;
  expectedDeliveryDate: string;
  requiredDeliveryDate: string;
  status: string;
  assignedTo: string;
  notes: string;
  isComplimentary: boolean;
}

const initialFormData: OrderFormData = {
  projectNumber: "",
  orderNumber: "",
  receivedDate: new Date().toISOString().split('T')[0],
  receiver: "",
  managementCode: "",
  customerId: "",
  orderCompany: "",
  orderPerson: "",
  orderDepartment: "",
  productName: "",
  productSpecs: "",
  quantity: "",
  orderFormat: "roll",
  unitPrice: "",
  totalAmount: "",
  expectedDeliveryDate: "",
  requiredDeliveryDate: "",
  status: "new",
  assignedTo: "",
  notes: "",
  isComplimentary: false,
};

export function OrderFormModal({ open, onOpenChange }: OrderFormModalProps) {
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create order");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "주문 생성 완료",
        description: "새로운 주문이 성공적으로 생성되었습니다.",
      });
      setFormData(initialFormData);
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "주문 생성 실패",
        description: "주문 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderData = {
      ...formData,
      customerId: formData.customerId === "none" ? null : parseInt(formData.customerId),
      assignedTo: formData.assignedTo === "none" ? null : parseInt(formData.assignedTo),
      quantity: parseInt(formData.quantity),
      unitPrice: formData.unitPrice,
      totalAmount: formData.totalAmount,
    };

    createOrderMutation.mutate(orderData);
  };

  const handleInputChange = (field: keyof OrderFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate total amount
    if (field === "quantity" || field === "unitPrice") {
      const qty = field === "quantity" ? parseFloat(value as string) : parseFloat(formData.quantity);
      const price = field === "unitPrice" ? parseFloat(value as string) : parseFloat(formData.unitPrice);
      
      if (!isNaN(qty) && !isNaN(price)) {
        setFormData(prev => ({
          ...prev,
          totalAmount: (qty * price).toString()
        }));
      }
    }
  };

  const selectedCustomer = customers?.find(c => c.id.toString() === formData.customerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>신규 주문 접수</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="projectNumber">프로젝트번호</Label>
                  <Input
                    id="projectNumber"
                    value={formData.projectNumber}
                    onChange={(e) => handleInputChange("projectNumber", e.target.value)}
                    placeholder="PRJ-2024-001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="receivedDate">접수일</Label>
                  <Input
                    id="receivedDate"
                    type="date"
                    value={formData.receivedDate}
                    onChange={(e) => handleInputChange("receivedDate", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="receiver">접수자</Label>
                  <Input
                    id="receiver"
                    value={formData.receiver}
                    onChange={(e) => handleInputChange("receiver", e.target.value)}
                    placeholder="김수진"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="managementCode">관리코드</Label>
                  <Input
                    id="managementCode"
                    value={formData.managementCode}
                    onChange={(e) => handleInputChange("managementCode", e.target.value)}
                    placeholder="MGT-001"
                  />
                </div>
                <div>
                  <Label htmlFor="status">상태</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">신규</SelectItem>
                      <SelectItem value="pending">대기</SelectItem>
                      <SelectItem value="in_progress">진행중</SelectItem>
                      <SelectItem value="completed">완료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">고객 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerId">고객사</Label>
                <Select value={formData.customerId} onValueChange={(value) => handleInputChange("customerId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="고객사 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">직접 입력</SelectItem>
                    {customers?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="orderCompany">주문회사명</Label>
                  <Input
                    id="orderCompany"
                    value={formData.orderCompany || selectedCustomer?.name || ""}
                    onChange={(e) => handleInputChange("orderCompany", e.target.value)}
                    placeholder="삼성디스플레이"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="orderPerson">주문담당자</Label>
                  <Input
                    id="orderPerson"
                    value={formData.orderPerson || selectedCustomer?.contactPerson || ""}
                    onChange={(e) => handleInputChange("orderPerson", e.target.value)}
                    placeholder="김영수"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="orderDepartment">부서</Label>
                  <Input
                    id="orderDepartment"
                    value={formData.orderDepartment}
                    onChange={(e) => handleInputChange("orderDepartment", e.target.value)}
                    placeholder="구매팀"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">제품 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="productName">제품명</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => handleInputChange("productName", e.target.value)}
                  placeholder="스마트폰 후면 라벨"
                  required
                />
              </div>

              <div>
                <Label htmlFor="productSpecs">제품 사양</Label>
                <Textarea
                  id="productSpecs"
                  value={formData.productSpecs}
                  onChange={(e) => handleInputChange("productSpecs", e.target.value)}
                  placeholder="50x30mm, 투명 PET, 실버 프린팅"
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">수량</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    placeholder="10000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="orderFormat">주문 형태</Label>
                  <Select value={formData.orderFormat} onValueChange={(value) => handleInputChange("orderFormat", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="형태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="roll">롤형태</SelectItem>
                      <SelectItem value="sheet">매엽형태</SelectItem>
                      <SelectItem value="custom">맞춤형태</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="unitPrice">단가</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => handleInputChange("unitPrice", e.target.value)}
                    placeholder="120"
                  />
                </div>
                <div>
                  <Label htmlFor="totalAmount">총액</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => handleInputChange("totalAmount", e.target.value)}
                    placeholder="1200000"
                    readOnly
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isComplimentary"
                    checked={formData.isComplimentary}
                    onChange={(e) => handleInputChange("isComplimentary", e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isComplimentary">무상 샘플</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">납기 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expectedDeliveryDate">예상 납기일</Label>
                  <Input
                    id="expectedDeliveryDate"
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) => handleInputChange("expectedDeliveryDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="requiredDeliveryDate">요청 납기일</Label>
                  <Input
                    id="requiredDeliveryDate"
                    type="date"
                    value={formData.requiredDeliveryDate}
                    onChange={(e) => handleInputChange("requiredDeliveryDate", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="assignedTo">담당자</Label>
                <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange("assignedTo", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="담당자 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">미지정</SelectItem>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">메모</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="긴급주문 - 우선 처리"
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={createOrderMutation.isPending}>
              {createOrderMutation.isPending ? "생성 중..." : "주문 생성"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}