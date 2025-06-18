import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LabelLibrary } from "@shared/schema";
import { formatDate } from "@/lib/utils";

interface LabelLibraryDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: LabelLibrary | null;
}

export function LabelLibraryDetailModal({ open, onOpenChange, item }: LabelLibraryDetailModalProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {item.labelName}
            <Badge variant={item.isActive ? "default" : "secondary"}>
              {item.isActive ? "활성" : "비활성"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">기본 정보</TabsTrigger>
            <TabsTrigger value="materials">소재/재질</TabsTrigger>
            <TabsTrigger value="printing">인쇄</TabsTrigger>
            <TabsTrigger value="finishing">가공/후처리</TabsTrigger>
            <TabsTrigger value="quality">품질 기준</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">라벨명</label>
                    <p className="text-sm">{item.labelName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">색상</label>
                    <p className="text-sm">{item.color || "미지정"}</p>
                  </div>
                </div>

                {item.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">설명</label>
                    <p className="text-sm mt-1">{item.description}</p>
                  </div>
                )}

                {item.labelTypes && item.labelTypes.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">라벨 유형</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.labelTypes.map((type) => (
                        <Badge key={type} variant="outline">{type}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">태그</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">최소 주문 수량</label>
                    <p className="text-sm">{item.minOrderQuantity || "미지정"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">단가</label>
                    <p className="text-sm">{item.unitPrice ? `₩${item.unitPrice.toLocaleString()}` : "미지정"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">리드타임</label>
                    <p className="text-sm">{item.leadTime ? `${item.leadTime}일` : "미지정"}</p>
                  </div>
                </div>

                {item.applications && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">적용 분야</label>
                    <p className="text-sm mt-1">{item.applications}</p>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                  <div>
                    <label className="font-medium">생성일</label>
                    <p>{formatDate(item.createdAt)}</p>
                  </div>
                  <div>
                    <label className="font-medium">수정일</label>
                    <p>{formatDate(item.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>소재 및 재질 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">소재 유형</label>
                    <p className="text-sm">{item.materialType || "미지정"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">접착제 유형</label>
                    <p className="text-sm">{item.adhesiveType || "미지정"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">크기</label>
                    <p className="text-sm">{item.size || "미지정"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">두께</label>
                    <p className="text-sm">{item.thickness || "미지정"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">투명도</label>
                    <p className="text-sm">{item.opacity || "미지정"}</p>
                  </div>
                </div>

                {item.specifications && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">규격 사양</label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{item.specifications}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">보관 조건</label>
                    <p className="text-sm">{item.storageConditions || "미지정"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">유효 기간</label>
                    <p className="text-sm">{item.shelfLife || "미지정"}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">화학적 저항성</label>
                  <p className="text-sm">{item.chemicalResistance || "미지정"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="printing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>인쇄 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">인쇄 방법</label>
                  <p className="text-sm">{item.printingMethod || "미지정"}</p>
                </div>

                {item.printMethods && item.printMethods.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">인쇄 방식</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.printMethods.map((method) => (
                        <Badge key={method} variant="outline">{method}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">인쇄 품질</label>
                  <p className="text-sm">{item.printQuality || "미지정"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finishing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>가공 및 후처리 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">후처리 방법</label>
                  <p className="text-sm">{item.finishingMethod || "미지정"}</p>
                </div>

                {item.finishingMethods && item.finishingMethods.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">후처리 방식</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.finishingMethods.map((method) => (
                        <Badge key={method} variant="outline">{method}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">광택도</label>
                    <p className="text-sm">{item.glossLevel || "미지정"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">내구성</label>
                    <p className="text-sm">{item.durability || "미지정"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">접착력</label>
                    <p className="text-sm">{item.adhesionStrength || "미지정"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">제거 가능성</label>
                    <p className="text-sm">{item.removability || "미지정"}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">재배치 가능성</label>
                  <p className="text-sm">{item.repositionability || "미지정"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>품질 기준 및 인증</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.qualityStandards && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">품질 기준</label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{item.qualityStandards}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">인증</label>
                  <p className="text-sm">{item.certifications || "미지정"}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">내수성</label>
                    <p className="text-sm">{item.waterResistance || "미지정"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">내UV성</label>
                    <p className="text-sm">{item.uvResistance || "미지정"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">온도 조건</label>
                    <p className="text-sm">{item.temperature || "미지정"}</p>
                  </div>
                </div>

                {item.sustainability && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">지속가능성</label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{item.sustainability}</p>
                  </div>
                )}

                {item.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">추가 메모</label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{item.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}