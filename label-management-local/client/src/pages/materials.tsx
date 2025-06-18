import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Filter, FileText, Award, AlertTriangle, Building2, Phone, Mail, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { Material, Supplier, SupplierContact, InsertMaterial, InsertSupplier } from "@shared/schema";
import { insertMaterialSchema, insertSupplierSchema } from "@shared/schema";

interface MaterialWithSupplier extends Material {
  primarySupplier: Supplier | null;
}

interface SupplierWithContacts extends Supplier {
  contacts: SupplierContact[];
}

export default function Materials() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierTypeFilter, setSupplierTypeFilter] = useState("all");
  const [approvalStatusFilter, setApprovalStatusFilter] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialWithSupplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierWithContacts | null>(null);

  // Materials query
  const { data: materials = [], isLoading: materialsLoading } = useQuery<MaterialWithSupplier[]>({
    queryKey: ['/api/materials', { search: searchTerm, category: categoryFilter, type: typeFilter, status: statusFilter }],
    enabled: true
  });

  // Suppliers query
  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery<SupplierWithContacts[]>({
    queryKey: ['/api/suppliers', { supplierType: supplierTypeFilter, approvalStatus: approvalStatusFilter }],
    enabled: true
  });

  const materialCategories = ["점착라벨용 원자재", "잉크", "후가공 잉크", "열박", "콜드박"];
  const materialTypes = ["원지", "접착제", "이형지", "수성잉크", "UV잉크", "솔벤트잉크", "열박필름", "콜드박필름"];
  const statusOptions = ["활성", "비활성", "검토중", "단종"];
  const supplierTypes = ["원자재공급업체", "잉크공급업체", "후가공업체", "박지공급업체"];
  const approvalStatuses = ["pending", "review", "approved", "rejected"];
  
  // 상태 매핑 함수들
  const getStatusDisplayName = (status: string) => {
    const statusMap: Record<string, string> = {
      "활성": "활성",
      "비활성": "비활성", 
      "단종예정": "단종예정",
      "단종": "단종"
    };
    return statusMap[status] || status;
  };
  
  const getApprovalDisplayName = (status: string) => {
    const approvalMap: Record<string, string> = {
      "pending": "대기",
      "review": "검토중", 
      "approved": "승인",
      "rejected": "거절"
    };
    return approvalMap[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "활성": "default",
      "비활성": "secondary",
      "검토중": "outline",
      "단종": "destructive"
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getApprovalBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "approved": "default",
      "pending": "outline",
      "review": "secondary",
      "rejected": "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{getApprovalDisplayName(status)}</Badge>;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-inter">원자재 라이브러리</h2>
            <p className="text-sm text-gray-600 mt-1">점착라벨 원자재, 잉크, 후가공 소재 및 공급업체 관리</p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  원자재 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>새 원자재 추가</DialogTitle>
                </DialogHeader>
                <MaterialAddForm />
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Building2 className="w-4 h-4 mr-2" />
                  공급업체 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>새 공급업체 추가</DialogTitle>
                </DialogHeader>
                <SupplierAddForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <Tabs defaultValue="materials" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="materials">원자재 관리</TabsTrigger>
            <TabsTrigger value="suppliers">공급업체 관리</TabsTrigger>
          </TabsList>

          {/* Materials Tab */}
          <TabsContent value="materials" className="space-y-6">
            {/* Materials Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  원자재 검색 및 필터
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="원자재명, 코드, 설명 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 카테고리</SelectItem>
                      {materialCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="타입 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 타입</SelectItem>
                      {materialTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 상태</SelectItem>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setTypeFilter("all");
                    setStatusFilter("all");
                  }}>
                    필터 초기화
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Materials Table */}
            <Card>
              <CardHeader>
                <CardTitle>원자재 목록</CardTitle>
              </CardHeader>
              <CardContent>
                {materialsLoading ? (
                  <div className="text-center py-8">로딩 중...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>원자재명</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead>타입</TableHead>
                        <TableHead>공급업체</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>규격</TableHead>
                        <TableHead>단가</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materials.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{material.name}</div>
                              <div className="text-sm text-gray-500">{material.materialCode}</div>
                            </div>
                          </TableCell>
                          <TableCell>{material.category}</TableCell>
                          <TableCell>{material.type}</TableCell>
                          <TableCell>
                            {material.primarySupplier ? (
                              <div>
                                <div className="font-medium">{material.primarySupplier.businessName}</div>
                                <div className="text-sm text-gray-500">{material.primarySupplier.supplierGrade}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">미지정</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(material.status || "활성")}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {material.length && <div>폭: {material.length}</div>}
                              {material.thickness && <div>두께: {material.thickness}</div>}
                            </div>
                          </TableCell>
                          <TableCell>
                            {material.unitPrice ? `₩${Number(material.unitPrice).toLocaleString()}` : "-"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedMaterial(material)}
                            >
                              상세보기
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-6">
            {/* Suppliers Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  공급업체 검색 및 필터
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={supplierTypeFilter} onValueChange={setSupplierTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="공급업체 타입" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 타입</SelectItem>
                      {supplierTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={approvalStatusFilter} onValueChange={setApprovalStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="승인 상태" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 상태</SelectItem>
                      {approvalStatuses.map((status) => (
                        <SelectItem key={status} value={status}>{getApprovalDisplayName(status)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => {
                    setSupplierTypeFilter("all");
                    setApprovalStatusFilter("all");
                  }}>
                    필터 초기화
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliersLoading ? (
                <div className="col-span-full text-center py-8">로딩 중...</div>
              ) : (
                suppliers.map((supplier) => (
                  <Card key={supplier.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedSupplier(supplier)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{supplier.businessName}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{supplier.supplierType}</p>
                        </div>
                        {getApprovalBadge(supplier.approvalStatus || "대기")}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{supplier.representativeName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span>{supplier.businessRegistrationNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="w-4 h-4 text-gray-400" />
                          <span>{supplier.supplierGrade || "등급 미지정"}</span>
                        </div>
                        {supplier.contacts.length > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{supplier.contacts.length}개 연락처</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Material Detail Modal */}
      <Dialog open={!!selectedMaterial} onOpenChange={() => setSelectedMaterial(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMaterial?.name} - 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedMaterial && (
            <div className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">기본 정보</TabsTrigger>
                  <TabsTrigger value="specs">기술 사양</TabsTrigger>
                  <TabsTrigger value="supplier">공급업체</TabsTrigger>
                  <TabsTrigger value="docs">문서</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>원자재명</Label>
                      <p className="text-sm font-medium">{selectedMaterial.name}</p>
                    </div>
                    <div>
                      <Label>원자재 코드</Label>
                      <p className="text-sm font-medium">{selectedMaterial.materialCode}</p>
                    </div>
                    <div>
                      <Label>카테고리</Label>
                      <p className="text-sm">{selectedMaterial.category}</p>
                    </div>
                    <div>
                      <Label>타입</Label>
                      <p className="text-sm">{selectedMaterial.type}</p>
                    </div>
                    <div>
                      <Label>상태</Label>
                      {getStatusBadge(selectedMaterial.status || "활성")}
                    </div>
                    <div>
                      <Label>단위</Label>
                      <p className="text-sm">{selectedMaterial.unit}</p>
                    </div>
                  </div>
                  <div>
                    <Label>설명</Label>
                    <p className="text-sm">{selectedMaterial.description || "설명 없음"}</p>
                  </div>
                </TabsContent>

                <TabsContent value="specs" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>길이/폭</Label>
                      <p className="text-sm">{selectedMaterial.length || "-"}</p>
                    </div>
                    <div>
                      <Label>두께</Label>
                      <p className="text-sm">{selectedMaterial.thickness || "-"}</p>
                    </div>
                    <div>
                      <Label>색상</Label>
                      <p className="text-sm">{selectedMaterial.color || "-"}</p>
                    </div>
                    <div>
                      <Label>투명도</Label>
                      <p className="text-sm">{selectedMaterial.opacity || "-"}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="supplier" className="space-y-4">
                  {selectedMaterial.primarySupplier ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{selectedMaterial.primarySupplier.businessName}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>대표자명</Label>
                            <p className="text-sm">{selectedMaterial.primarySupplier.representativeName}</p>
                          </div>
                          <div>
                            <Label>사업자등록번호</Label>
                            <p className="text-sm">{selectedMaterial.primarySupplier.businessRegistrationNumber}</p>
                          </div>
                          <div>
                            <Label>공급업체 등급</Label>
                            <p className="text-sm">{selectedMaterial.primarySupplier.supplierGrade || "미지정"}</p>
                          </div>
                          <div>
                            <Label>승인 상태</Label>
                            {getApprovalBadge(selectedMaterial.primarySupplier.approvalStatus || "대기")}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <p className="text-center py-8 text-gray-500">주 공급업체가 지정되지 않았습니다.</p>
                  )}
                </TabsContent>

                <TabsContent value="docs" className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>기술 문서 관리 기능이 곧 제공됩니다.</p>
                    <p className="text-sm mt-2">MSDS, TDS 등의 문서를 관리할 수 있습니다.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Supplier Detail Modal */}
      <Dialog open={!!selectedSupplier} onOpenChange={() => setSelectedSupplier(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSupplier?.businessName} - 공급업체 정보</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-6">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">기본 정보</TabsTrigger>
                  <TabsTrigger value="contacts">연락처</TabsTrigger>
                  <TabsTrigger value="materials">공급 원자재</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>사업체명</Label>
                      <p className="text-sm font-medium">{selectedSupplier.businessName}</p>
                    </div>
                    <div>
                      <Label>사업자등록번호</Label>
                      <p className="text-sm font-medium">{selectedSupplier.businessRegistrationNumber}</p>
                    </div>
                    <div>
                      <Label>대표자명</Label>
                      <p className="text-sm">{selectedSupplier.representativeName}</p>
                    </div>
                    <div>
                      <Label>공급업체 타입</Label>
                      <p className="text-sm">{selectedSupplier.supplierType}</p>
                    </div>
                    <div>
                      <Label>공급업체 등급</Label>
                      <p className="text-sm">{selectedSupplier.supplierGrade || "미지정"}</p>
                    </div>
                    <div>
                      <Label>승인 상태</Label>
                      {getApprovalBadge(selectedSupplier.approvalStatus || "대기")}
                    </div>
                  </div>
                  <div>
                    <Label>사업장 주소</Label>
                    <p className="text-sm">{selectedSupplier.businessAddress}</p>
                  </div>
                </TabsContent>

                <TabsContent value="contacts" className="space-y-4">
                  {selectedSupplier.contacts.length > 0 ? (
                    <div className="space-y-4">
                      {selectedSupplier.contacts.map((contact) => (
                        <Card key={contact.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span className="font-medium">{contact.name}</span>
                                  {contact.isPrimary && <Badge variant="default" className="text-xs">주담당자</Badge>}
                                </div>
                                {contact.position && (
                                  <p className="text-sm text-gray-600">{contact.position}</p>
                                )}
                                <div className="space-y-1">
                                  {contact.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Mail className="w-4 h-4 text-gray-400" />
                                      <span>{contact.email}</span>
                                    </div>
                                  )}
                                  {contact.directPhone && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Phone className="w-4 h-4 text-gray-400" />
                                      <span>{contact.directPhone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">등록된 연락처가 없습니다.</p>
                  )}
                </TabsContent>

                <TabsContent value="materials" className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <p>이 공급업체가 공급하는 원자재 목록이 표시됩니다.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 원자재 추가 폼 컴포넌트
function MaterialAddForm() {
  const { toast } = useToast();
  const [customCategory, setCustomCategory] = useState("");
  const [customRawMaterial, setCustomRawMaterial] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [customAdhesiveType, setCustomAdhesiveType] = useState("");
  const [customReleaseFilm, setCustomReleaseFilm] = useState("");
  const [widthType, setWidthType] = useState("");
  
  const materialCategories = ["점착라벨용 원자재", "잉크", "후가공 잉크", "열박", "콜드박", "기타"];
  const rawMaterials = ["AT", "모조지", "크래프트지", "PP", "PET", "PE", "OPP", "BOPP", "HDPP", "LDPP", "HDPE", "LDPE", "파스클리어", "기타"];
  const colors = ["유광투명", "무광투명", "유광백색", "무광백색", "은광", "은무광", "기타"];
  const adhesiveTypes = ["영구접착", "리무버블", "수분리", "강접착", "초강접착", "냉장용", "냉동용", "고온용", "기타"];
  const releaseFilms = ["BG", "WG", "YP", "투명PP", "투명PET", "크라프트", "기타"];
  const widthTypes = ["전폭", "자유폭", "지정폭"];
  const adhesionUnits = ["N/25mm", "gf/in"];
  
  const form = useForm<InsertMaterial>({
    resolver: zodResolver(insertMaterialSchema),
    defaultValues: {
      name: "",
      category: "",
      status: "활성"
    }
  });

  // MOQ 가격 자동 계산 - 정확한 계산식
  useEffect(() => {
    const unitPrice = parseFloat(form.watch("unitPrice") || "0");
    const width = parseFloat(form.watch("width") || "0");
    const length = parseFloat(form.watch("length") || "0");
    
    if (unitPrice && width && length) {
      // 폭(mm) * 길이(m) = 총 면적(m²), 그 다음 단위가격을 곱함
      const widthInMeters = width / 1000; // mm를 m로 변환
      const totalArea = widthInMeters * length; // 면적 계산 (m²)
      const calculatedMOQ = totalArea * unitPrice; // 면적(m²) × 단위가격(원/m²)
      form.setValue("minimumOrderQuantity", calculatedMOQ.toString());
    }
  }, [form.watch("unitPrice"), form.watch("width"), form.watch("length")]);

  const createMaterial = useMutation({
    mutationFn: (data: InsertMaterial) => apiRequest("/api/materials", "POST", data),
    onSuccess: () => {
      toast({
        title: "성공",
        description: "원자재가 추가되었습니다."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: "원자재 추가에 실패했습니다.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: InsertMaterial) => {
    createMaterial.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>자재명 *</FormLabel>
                <FormControl>
                  <Input placeholder="자재명을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="supplierProductCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>공급사 제품코드</FormLabel>
                <FormControl>
                  <Input placeholder="공급사 제품코드" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="materialCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>라이브러리 코드</FormLabel>
                <FormControl>
                  <Input placeholder="라이브러리 코드" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>카테고리 *</FormLabel>
                <Select onValueChange={(value) => {
                  if (value === "기타") {
                    setCustomCategory("");
                    field.onChange("기타");
                  } else {
                    field.onChange(value);
                    setCustomCategory("");
                  }
                }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {materialCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 기타 카테고리 직접 입력 */}
        {(form.watch("category") === "기타" || customCategory !== "") && (
          <FormItem>
            <FormLabel>카테고리 직접 입력</FormLabel>
            <FormControl>
              <Input 
                placeholder="카테고리명을 입력하세요" 
                value={customCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomCategory(value);
                  form.setValue("category", value);
                  // 값이 완전히 비어있으면 상태 초기화
                  if (!value.trim()) {
                    setCustomCategory("");
                    form.setValue("category", "");
                  }
                }}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement;
                  // 스페이스바로 내용을 지우려 할 때
                  if (e.key === ' ' && target.value.trim() === '') {
                    e.preventDefault();
                    setCustomCategory("");
                    form.setValue("category", "");
                  }
                }}
                onKeyUp={(e) => {
                  const target = e.target as HTMLInputElement;
                  // 백스페이스, 딜리트로 내용이 모두 지워졌을 때
                  if ((e.key === 'Backspace' || e.key === 'Delete') && !target.value.trim()) {
                    setCustomCategory("");
                    form.setValue("category", "");
                  }
                }}
              />
            </FormControl>
          </FormItem>
        )}

        {/* 원재료 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormLabel>원재료</FormLabel>
            <Select onValueChange={(value) => {
              if (value === "기타") {
                setCustomRawMaterial("");
                form.setValue("subType", "기타");
              } else {
                form.setValue("subType", value);
                setCustomRawMaterial("");
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="원재료 선택" />
              </SelectTrigger>
              <SelectContent>
                {rawMaterials.map((material) => (
                  <SelectItem key={material} value={material}>{material}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(form.watch("subType") === "기타" || customRawMaterial !== "") && (
              <Input 
                className="mt-2"
                placeholder="원재료명 직접 입력" 
                value={customRawMaterial}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomRawMaterial(value);
                  form.setValue("subType", value);
                  if (!value.trim()) {
                    setCustomRawMaterial("");
                    form.setValue("subType", "");
                  }
                }}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (e.key === ' ' && target.value.trim() === '') {
                    e.preventDefault();
                    setCustomRawMaterial("");
                    form.setValue("subType", "");
                  }
                }}
                onKeyUp={(e) => {
                  const target = e.target as HTMLInputElement;
                  if ((e.key === 'Backspace' || e.key === 'Delete') && !target.value.trim()) {
                    setCustomRawMaterial("");
                    form.setValue("subType", "");
                  }
                }}
              />
            )}
          </div>

          <div>
            <FormLabel>색상</FormLabel>
            <Select onValueChange={(value) => {
              if (value === "기타") {
                setCustomColor("");
                form.setValue("color", "기타");
              } else {
                form.setValue("color", value);
                setCustomColor("");
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="색상 선택" />
              </SelectTrigger>
              <SelectContent>
                {colors.map((color) => (
                  <SelectItem key={color} value={color}>{color}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(form.watch("color") === "기타" || customColor !== "") && (
              <Input 
                className="mt-2"
                placeholder="색상 직접 입력" 
                value={customColor}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomColor(value);
                  form.setValue("color", value);
                  if (!value.trim()) {
                    setCustomColor("");
                    form.setValue("color", "");
                  }
                }}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (e.key === ' ' && target.value.trim() === '') {
                    e.preventDefault();
                    setCustomColor("");
                    form.setValue("color", "");
                  }
                }}
                onKeyUp={(e) => {
                  const target = e.target as HTMLInputElement;
                  if ((e.key === 'Backspace' || e.key === 'Delete') && !target.value.trim()) {
                    setCustomColor("");
                    form.setValue("color", "");
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* 두께 및 평량 */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="thickness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>두께 (μm)</FormLabel>
                <FormControl>
                  <Input placeholder="두께" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>평량 (g/m²)</FormLabel>
                <FormControl>
                  <Input placeholder="평량" {...field} value={field.value?.toString() || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 접착제 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="adhesionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>접착제명</FormLabel>
                <FormControl>
                  <Input placeholder="접착제명" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>접착제 타입</FormLabel>
            <Select onValueChange={(value) => {
              if (value === "기타") {
                setCustomAdhesiveType("");
                form.setValue("adhesiveType", "기타");
              } else {
                form.setValue("adhesiveType", value);
                setCustomAdhesiveType("");
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="접착제 타입 선택" />
              </SelectTrigger>
              <SelectContent>
                {adhesiveTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(form.watch("adhesiveType") === "기타" || customAdhesiveType !== "") && (
              <Input 
                className="mt-2"
                placeholder="접착제 타입 직접 입력" 
                value={customAdhesiveType}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomAdhesiveType(value);
                  form.setValue("adhesiveType", value);
                  if (!value.trim()) {
                    setCustomAdhesiveType("");
                    form.setValue("adhesiveType", "");
                  }
                }}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (e.key === ' ' && target.value.trim() === '') {
                    e.preventDefault();
                    setCustomAdhesiveType("");
                    form.setValue("adhesiveType", "");
                  }
                }}
                onKeyUp={(e) => {
                  const target = e.target as HTMLInputElement;
                  if ((e.key === 'Backspace' || e.key === 'Delete') && !target.value.trim()) {
                    setCustomAdhesiveType("");
                    form.setValue("adhesiveType", "");
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* 접착력 */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="adhesionStrength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>접착력 값</FormLabel>
                <FormControl>
                  <Input placeholder="접착력" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel className="flex items-center gap-2">
              접착력 단위
              <div className="relative group">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 z-10">
                  <div className="font-semibold">N/25mm:</div>
                  <div className="mb-2">국제단위계(SI)를 따르는 단위, 25mm 너비의 표면에서 떼어질 때 필요한 힘을 뉴턴(N) 단위로 측정</div>
                  <div className="font-semibold">gf/in:</div>
                  <div>점착 라벨이 1인치 너비의 표면에서 떼어질 때 필요한 힘을 그램-포스(gf) 단위로 측정</div>
                </div>
              </div>
            </FormLabel>
            <Select onValueChange={(value) => form.setValue("adhesiveStrengthUnit", value)}>
              <SelectTrigger>
                <SelectValue placeholder="단위 선택" />
              </SelectTrigger>
              <SelectContent>
                {adhesionUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 이형지 */}
        <div>
          <FormLabel>이형지</FormLabel>
          <Select onValueChange={(value) => {
            if (value === "기타") {
              setCustomReleaseFilm("");
              form.setValue("backingPaperType", "기타");
            } else {
              form.setValue("backingPaperType", value);
              setCustomReleaseFilm("");
            }
          }}>
            <SelectTrigger>
              <SelectValue placeholder="이형지 선택" />
            </SelectTrigger>
            <SelectContent>
              {releaseFilms.map((film) => (
                <SelectItem key={film} value={film}>{film}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(form.watch("backingPaperType") === "기타" || customReleaseFilm !== "") && (
            <Input 
              className="mt-2"
              placeholder="이형지 직접 입력" 
              value={customReleaseFilm}
              onChange={(e) => {
                const value = e.target.value;
                setCustomReleaseFilm(value);
                form.setValue("backingPaperType", value);
                if (!value.trim()) {
                  setCustomReleaseFilm("");
                  form.setValue("backingPaperType", "");
                }
              }}
              onKeyDown={(e) => {
                const target = e.target as HTMLInputElement;
                if (e.key === ' ' && target.value.trim() === '') {
                  e.preventDefault();
                  setCustomReleaseFilm("");
                  form.setValue("backingPaperType", "");
                }
              }}
              onKeyUp={(e) => {
                const target = e.target as HTMLInputElement;
                if ((e.key === 'Backspace' || e.key === 'Delete') && !target.value.trim()) {
                  setCustomReleaseFilm("");
                  form.setValue("backingPaperType", "");
                }
              }}
            />
          )}
        </div>

        {/* 폭 및 길이 정보 */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <FormLabel>폭 유형</FormLabel>
            <Select onValueChange={(value) => {
              setWidthType(value);
              form.setValue("unit", value === "전폭" ? "전폭" : "m");
            }}>
              <SelectTrigger>
                <SelectValue placeholder="폭 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                {widthTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>폭 (mm)</FormLabel>
                <FormControl>
                  <Input placeholder="폭" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="length"
            render={({ field }) => (
              <FormItem>
                <FormLabel>길이 (m)</FormLabel>
                <FormControl>
                  <Input placeholder="길이" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>



        {/* 가격 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>제곱미터당 가격 (원/m²)</FormLabel>
                <FormControl>
                  <Input placeholder="제곱미터당 가격" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>MOQ 구매 가격 (자동 계산)</FormLabel>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm text-blue-600 mb-1">계산식: 폭(mm→m) × 길이(m) × 단위가격(원/m²)</div>
              {(() => {
                const unitPrice = parseFloat(String(form.watch("unitPrice") || "0"));
                const width = parseFloat(String(form.watch("width") || "0")); // mm
                const length = parseFloat(String(form.watch("length") || "0")); // m
                
                if (unitPrice && width && length) {
                  // 단위 환산: 폭(mm → m) × 길이(m) = 면적(m²)
                  const widthInMeters = width / 1000; // mm를 m로 변환
                  const totalArea = widthInMeters * length; // 면적 계산 (m²)
                  const calculatedPrice = totalArea * unitPrice;
                  
                  return (
                    <div className="text-lg font-semibold text-blue-400">
                      <div>{calculatedPrice.toLocaleString()}원</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        폭: {width}mm({widthInMeters.toFixed(3)}m) × 길이: {length}m = {totalArea.toFixed(3)}m²
                      </div>
                    </div>
                  );
                }
                return <span className="text-muted-foreground">단위가격, 폭, 길이를 입력하세요</span>;
              })()}
            </div>
          </div>
        </div>

        {/* 상태 */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상태</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="활성">활성</SelectItem>
                  <SelectItem value="비활성">비활성</SelectItem>
                  <SelectItem value="검토중">검토중</SelectItem>
                  <SelectItem value="단종">단종</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 관련문서 */}
        <div>
          <FormLabel>관련문서</FormLabel>
          <div className="mt-2 space-y-2">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">파일을 드래그하거나 클릭하여 업로드 (여러 파일 선택 가능)</p>
                <Button type="button" variant="outline" size="sm">
                  파일 선택
                </Button>
              </div>
            </div>
            
            {/* 첨부된 파일 목록 */}
            <div className="space-y-2">
              {/* 파일 목록이 표시될 영역 */}
              <div className="text-xs text-gray-500">
                첨부된 파일: 아직 파일이 없습니다
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={createMaterial.isPending}>
            {createMaterial.isPending ? "추가 중..." : "원자재 추가"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// 공급업체 추가 폼 컴포넌트
function SupplierAddForm() {
  const { toast } = useToast();
  const supplierTypes = ["원자재공급업체", "잉크공급업체", "후가공업체", "박지공급업체"];
  
  const form = useForm<InsertSupplier>({
    resolver: zodResolver(insertSupplierSchema),
    defaultValues: {
      businessRegistrationNumber: "",
      businessName: "",
      representativeName: "",
      businessAddress: "",
      supplierType: "",
      approvalStatus: "pending"
    }
  });

  const createSupplier = useMutation({
    mutationFn: (data: InsertSupplier) => apiRequest("/api/suppliers", "POST", data),
    onSuccess: () => {
      toast({
        title: "성공",
        description: "공급업체가 추가되었습니다."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: "공급업체 추가에 실패했습니다.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: InsertSupplier) => {
    createSupplier.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="businessRegistrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>사업자등록번호 *</FormLabel>
                <FormControl>
                  <Input placeholder="000-00-00000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>회사명 *</FormLabel>
                <FormControl>
                  <Input placeholder="회사명을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="representativeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>대표자명 *</FormLabel>
                <FormControl>
                  <Input placeholder="대표자명을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supplierType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>공급업체 유형 *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="유형 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {supplierTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="businessAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>사업장 주소 *</FormLabel>
              <FormControl>
                <Input placeholder="사업장 주소를 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>연락처</FormLabel>
                <FormControl>
                  <Input placeholder="02-0000-0000" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>사업자명</FormLabel>
                <FormControl>
                  <Input placeholder="사업자명" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비고</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="공급업체에 대한 추가 정보를 입력하세요"
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={createSupplier.isPending}>
            {createSupplier.isPending ? "추가 중..." : "공급업체 추가"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
