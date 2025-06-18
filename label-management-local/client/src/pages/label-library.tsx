import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, ShoppingCart, RotateCcw, FileEdit, Edit, Copy, Trash2, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { LabelLibrary } from "@shared/schema";
import CompleteLabelFormModal from "@/components/label-library/complete-label-form-modal";
import { LabelLibraryDetailModal } from "@/components/label-library/label-library-detail-modal";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function LabelLibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LabelLibrary | null>(null);
  const [editingItem, setEditingItem] = useState<LabelLibrary | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: labelLibrary, isLoading } = useQuery({
    queryKey: ["/api/label-library", searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/label-library?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/label-library/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error('Failed to delete');
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/label-library"] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async ({ id, newName }: { id: number; newName: string }) => {
      const response = await fetch(`/api/label-library/${id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName }),
      });
      if (!response.ok) throw new Error('Failed to duplicate');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/label-library"] });
    },
  });

  // 주문 생성 mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return apiRequest("/api/orders", "POST", orderData);
    },
    onSuccess: () => {
      toast({ title: "성공", description: "주문이 접수되었습니다." });
      setSelectedLabels([]);
    },
    onError: () => {
      toast({ title: "오류", description: "주문 접수 중 오류가 발생했습니다." });
    }
  });

  const handleViewDetails = (item: LabelLibrary) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const handleEdit = (item: LabelLibrary) => {
    setEditingItem(item);
    setFormModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("이 라벨 사양을 삭제하시겠습니까?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (item: LabelLibrary) => {
    const newName = prompt("복사할 라벨 이름을 입력하세요:", `${item.labelName} (복사본)`);
    if (newName) {
      duplicateMutation.mutate({ id: item.id, newName });
    }
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setFormModalOpen(false);
    setEditingItem(null);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedItem(null);
  };

  // 체크박스 관련 함수들
  const handleSelectLabel = (labelId: number, checked: boolean) => {
    if (checked) {
      setSelectedLabels(prev => [...prev, labelId]);
    } else {
      setSelectedLabels(prev => prev.filter(id => id !== labelId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLabels(labelLibrary?.map((label: LabelLibrary) => label.id) || []);
    } else {
      setSelectedLabels([]);
    }
  };

  // 주문 생성 함수들
  const handleNewOrder = () => {
    if (selectedLabels.length === 0) {
      toast({ title: "오류", description: "선택된 라벨이 없습니다." });
      return;
    }

    const selectedLabelData = labelLibrary?.filter((label: LabelLibrary) => selectedLabels.includes(label.id));
    
    selectedLabelData?.forEach((label: LabelLibrary) => {
      const orderData = {
        customerId: null,
        productName: label.labelName,
        productSpecs: `${label.labelTypes?.[0] || '라벨'} - ${label.width}x${label.height}mm`,
        orderFormat: "신규발주",
        labelLibraryId: label.id,
        status: "신규",
        notes: `라벨라이브러리에서 신규발주: ${label.labelName}`,
      };
      
      createOrderMutation.mutate(orderData);
    });
  };

  const handleReorder = () => {
    if (selectedLabels.length === 0) {
      toast({ title: "오류", description: "선택된 라벨이 없습니다." });
      return;
    }

    const selectedLabelData = labelLibrary?.filter((label: LabelLibrary) => selectedLabels.includes(label.id));
    
    selectedLabelData?.forEach((label: LabelLibrary) => {
      const orderData = {
        customerId: null,
        productName: label.labelName,
        productSpecs: `${label.labelTypes?.[0] || '라벨'} - ${label.width}x${label.height}mm`,
        orderFormat: "재발주",
        labelLibraryId: label.id,
        status: "신규",
        notes: `라벨라이브러리에서 재발주: ${label.labelName}`,
      };
      
      createOrderMutation.mutate(orderData);
    });
  };

  const handleModifyOrder = () => {
    if (selectedLabels.length === 0) {
      toast({ title: "오류", description: "선택된 라벨이 없습니다." });
      return;
    }

    const selectedLabelData = labelLibrary?.filter((label: LabelLibrary) => selectedLabels.includes(label.id));
    
    selectedLabelData?.forEach((label: LabelLibrary) => {
      const orderData = {
        customerId: null,
        productName: label.labelName,
        productSpecs: `${label.labelTypes?.[0] || '라벨'} - ${label.width}x${label.height}mm`,
        orderFormat: "수정발주",
        labelLibraryId: label.id,
        status: "검토중",
        notes: `라벨라이브러리에서 수정발주: ${label.labelName}`,
      };
      
      createOrderMutation.mutate(orderData);
    });
  };

  const getLabelTypesDisplay = (labelTypes: string[] | null) => {
    if (!labelTypes || labelTypes.length === 0) return "-";
    return labelTypes.slice(0, 2).join(", ") + (labelTypes.length > 2 ? ` +${labelTypes.length - 2}` : "");
  };

  const getPrintMethodsDisplay = (printMethods: string[] | null) => {
    if (!printMethods || printMethods.length === 0) return "-";
    return printMethods.slice(0, 2).join(", ") + (printMethods.length > 2 ? ` +${printMethods.length - 2}` : "");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">라벨 라이브러리</h1>
          <p className="text-muted-foreground">라벨 제작 사양을 체계적으로 관리하세요</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-primary hover:bg-primary/90">
          <i className="fas fa-plus mr-2"></i>
          새 라벨 사양 등록
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Input
                placeholder="라벨명, 품목명, 용도로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <Button variant="outline">
              <i className="fas fa-filter mr-2"></i>
              필터
            </Button>
            <Button variant="outline">
              <i className="fas fa-download mr-2"></i>
              엑셀 다운로드
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Label Library Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : labelLibrary?.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">
              <i className="fas fa-tags"></i>
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">등록된 라벨 사양이 없습니다</h3>
            <p className="text-gray-500 mb-4">첫 번째 라벨 사양을 등록해보세요</p>
            <Button onClick={handleCreateNew}>
              <i className="fas fa-plus mr-2"></i>
              라벨 사양 등록
            </Button>
          </div>
        ) : (
          labelLibrary?.map((item: LabelLibrary) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.labelName}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{item.customerCode || "고객사 코드 미입력"}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <i className="fas fa-edit text-blue-600"></i>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(item);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <i className="fas fa-copy text-green-600"></i>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <i className="fas fa-trash text-red-600"></i>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent 
                className="pt-0 space-y-3"
                onClick={() => handleViewDetails(item)}
              >
                {/* 기본 정보 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">크기:</span>
                    <span className="font-medium">
                      {item.sizeWidth && item.sizeHeight 
                        ? `${item.sizeWidth} × ${item.sizeHeight} mm`
                        : "미지정"
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">형태:</span>
                    <span className="font-medium">{item.shape || "미지정"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">색상:</span>
                    <span className="font-medium">{item.color || "미지정"}</span>
                  </div>
                </div>

                {/* 라벨 종류 */}
                <div>
                  <div className="text-sm text-gray-600 mb-1">라벨 종류:</div>
                  <div className="flex flex-wrap gap-1">
                    {item.labelTypes && item.labelTypes.length > 0 ? (
                      item.labelTypes.slice(0, 3).map((type, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">미지정</Badge>
                    )}
                    {item.labelTypes && item.labelTypes.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.labelTypes.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 인쇄 방식 */}
                <div>
                  <div className="text-sm text-gray-600 mb-1">인쇄 방식:</div>
                  <div className="flex flex-wrap gap-1">
                    {item.printMethods && item.printMethods.length > 0 ? (
                      item.printMethods.slice(0, 2).map((method, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {method}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">미지정</Badge>
                    )}
                    {item.printMethods && item.printMethods.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.printMethods.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 품질 등급 */}
                {item.printQuality && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">품질 등급:</span>
                    <Badge 
                      variant={item.printQuality === "최고급" ? "default" : item.printQuality === "고급" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {item.printQuality}
                    </Badge>
                  </div>
                )}

                {/* 등록 정보 */}
                <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
                  등록일: {formatDate(item.createdAt)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modals */}
      <CompleteLabelFormModal
        isOpen={formModalOpen}
        onClose={handleCloseFormModal}
        onSuccess={() => {
          handleCloseFormModal();
          setEditingItem(null);
        }}
      />

      <LabelLibraryDetailModal
        open={detailModalOpen}
        onOpenChange={handleCloseDetailModal}
        item={selectedItem}
      />
    </div>
  );
}