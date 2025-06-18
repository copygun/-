import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, X } from "lucide-react";
import { insertLabelLibrarySchema, type InsertLabelLibrary } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CompleteLabelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Section header component with color bar
const SectionHeader = ({ title, color = "blue" }: { title: string; color?: string }) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500", 
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
    indigo: "bg-indigo-500",
    pink: "bg-pink-500",
    gray: "bg-gray-500"
  };
  
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-1 h-6 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} rounded-full`}></div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
  );
};

export default function CompleteLabelFormModal({
  isOpen,
  onClose,
  onSuccess,
}: CompleteLabelFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pantoneColors, setPantoneColors] = useState<string[]>([""]);
  const [customInspectionItems, setCustomInspectionItems] = useState<string[]>([""]);
  const [showCustomHotStamping, setShowCustomHotStamping] = useState(false);
  const [showCustomColdStamping, setShowCustomColdStamping] = useState(false);
  const [showCustomInspection, setShowCustomInspection] = useState(false);

  // Helper function to handle key events for clearing dropdown selections
  const handleSelectKeyDown = (event: React.KeyboardEvent, onChange: (value: string) => void) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      onChange('');
    }
  };

  // Fetch materials for dropdowns
  const { data: materials } = useQuery({
    queryKey: ["/api/materials"],
    enabled: isOpen,
  });

  const form = useForm<InsertLabelLibrary>({
    resolver: zodResolver(insertLabelLibrarySchema),
    defaultValues: {
      labelName: "",
      customerCode: "",
      libraryCode: "",
      otherCode: "",
      sizeWidth: "",
      sizeHeight: "",
      shape: "사각형",
      totalOrderQuantity: "",
      releaseDirection: "상하박리",
      labelType: "투명",
      usageEnvironment: "실내",
      adhesiveSurface: "PET",
      materialLibraryId: undefined,
      thickness: "",
      color: "",
      adhesive: "",
      releaseFilm: "",
      specialColorCount: 0,
      pantoneColors: [],
      printMethods: [],
      hotStampingMaterial: "",
      coldStampingMaterial: "",
      uvCoatingType: "",
      laminatingType: "",
      cuttingMethod: "하프컷(Half Cut)",
      cuttingPrecision: "±0.3mm",
      inspectionItems: [],
      customInspectionItems: [],
      colorDifferenceStandard: "ΔE*ab",
      colorDifferenceValue: 2.0,
      qualityGrade: "고급",
      tags: [],
      notes: "",
      isActive: true,
    },
  });

  // Watch form values for dynamic updates
  const watchSpecialColorCount = form.watch("specialColorCount");
  const watchMaterialLibraryId = form.watch("materialLibraryId");
  const watchQualityGrade = form.watch("qualityGrade");
  const watchUvCoatingType = form.watch("uvCoatingType");
  const watchLaminatingType = form.watch("laminatingType");
  const watchHotStampingMaterial = form.watch("hotStampingMaterial");
  const watchColdStampingMaterial = form.watch("coldStampingMaterial");
  const watchInspectionItems = form.watch("inspectionItems");

  // Update PANTONE color fields based on special color count
  React.useEffect(() => {
    const count = watchSpecialColorCount || 0;
    setPantoneColors(prev => {
      const newColors = [...prev];
      if (count > newColors.length) {
        while (newColors.length < count) {
          newColors.push("");
        }
      } else if (count < newColors.length) {
        newColors.splice(count);
      }
      return newColors;
    });
  }, [watchSpecialColorCount]);

  // Auto-populate material library fields
  React.useEffect(() => {
    if (watchMaterialLibraryId && materials) {
      const selectedMaterial = materials.find((m: any) => m.id === parseInt(watchMaterialLibraryId));
      if (selectedMaterial) {
        form.setValue("thickness", selectedMaterial.thickness || "");
        form.setValue("color", selectedMaterial.color || "");
        form.setValue("adhesive", selectedMaterial.adhesiveType || "");
        form.setValue("releaseFilm", selectedMaterial.releaseFilm || "");
      }
    }
  }, [watchMaterialLibraryId, materials, form]);

  // Auto-set color difference value based on quality grade
  React.useEffect(() => {
    if (watchQualityGrade === "최고급") {
      form.setValue("colorDifferenceValue", 1.5);
    } else if (watchQualityGrade === "고급") {
      form.setValue("colorDifferenceValue", 2.0);
    }
  }, [watchQualityGrade, form]);

  // Handle custom input visibility
  React.useEffect(() => {
    setShowCustomHotStamping(watchHotStampingMaterial === "기타");
    setShowCustomColdStamping(watchColdStampingMaterial === "기타");
    setShowCustomInspection(watchInspectionItems?.includes("기타") || false);
  }, [watchHotStampingMaterial, watchColdStampingMaterial, watchInspectionItems]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertLabelLibrary) => {
      const response = await apiRequest("/api/label-library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          pantoneColors: pantoneColors.filter(color => color.trim()),
          customInspectionItems: customInspectionItems.filter(item => item.trim()),
        }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/label-library"] });
      toast({ title: "라벨이 성공적으로 생성되었습니다." });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "라벨 생성 실패",
        description: error.message || "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertLabelLibrary) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 라벨 생성</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* 1. 기본 정보 */}
            <Card>
              <CardHeader>
                <SectionHeader title="1. 기본 정보" color="blue" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="labelName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>라벨명 *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="라벨명을 입력하세요" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>고객사 코드</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="고객사 코드" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="libraryCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>라이브러리 코드</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="라이브러리 코드" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="otherCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>기타 코드</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="기타 코드" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. 크기 및 형태 */}
            <Card>
              <CardHeader>
                <SectionHeader title="2. 크기 및 형태" color="green" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="sizeWidth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>가로 크기 (mm)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="가로" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sizeHeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>세로 크기 (mm)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="세로" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shape"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>형태</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger onKeyDown={(e) => handleSelectKeyDown(e, field.onChange)}>
                              <SelectValue placeholder="형태 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="사각형">사각형</SelectItem>
                            <SelectItem value="원형">원형</SelectItem>
                            <SelectItem value="타원형">타원형</SelectItem>
                            <SelectItem value="이형">이형</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="totalOrderQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>총 발주수량</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="수량" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="releaseDirection"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>풀림방향</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger onKeyDown={(e) => handleSelectKeyDown(e, field.onChange)}>
                              <SelectValue placeholder="풀림방향 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="상">상</SelectItem>
                            <SelectItem value="하">하</SelectItem>
                            <SelectItem value="좌">좌</SelectItem>
                            <SelectItem value="우">우</SelectItem>
                            <SelectItem value="기타">기타</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch("releaseDirection") === "기타" && (
                    <FormItem>
                      <FormLabel>풀림방향 직접 입력</FormLabel>
                      <FormControl>
                        <Input placeholder="풀림방향 직접 입력" />
                      </FormControl>
                    </FormItem>
                  )}
                  <FormField
                    control={form.control}
                    name="labelType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>라벨 종류</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger onKeyDown={(e) => handleSelectKeyDown(e, field.onChange)}>
                              <SelectValue placeholder="라벨 종류 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="투명">투명</SelectItem>
                            <SelectItem value="유색">유색</SelectItem>
                            <SelectItem value="홀로그램">홀로그램</SelectItem>
                            <SelectItem value="메탈릭">메탈릭</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 3. 사용 환경 */}
            <Card>
              <CardHeader>
                <SectionHeader title="3. 사용 환경" color="yellow" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="usageEnvironment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>사용 환경</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger onKeyDown={(e) => handleSelectKeyDown(e, field.onChange)}>
                              <SelectValue placeholder="사용 환경 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="실내">실내</SelectItem>
                            <SelectItem value="실외">실외</SelectItem>
                            <SelectItem value="냉동">냉동</SelectItem>
                            <SelectItem value="고온">고온</SelectItem>
                            <SelectItem value="기타">기타</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="adhesiveSurface"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>피착면</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger onKeyDown={(e) => handleSelectKeyDown(e, field.onChange)}>
                              <SelectValue placeholder="피착면 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PET">PET</SelectItem>
                            <SelectItem value="PP">PP</SelectItem>
                            <SelectItem value="PE">PE</SelectItem>
                            <SelectItem value="HDPE">HDPE</SelectItem>
                            <SelectItem value="LDPE">LDPE</SelectItem>
                            <SelectItem value="유리">유리</SelectItem>
                            <SelectItem value="금속">금속</SelectItem>
                            <SelectItem value="기타">기타</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 4. 자재 사양 */}
            <Card>
              <CardHeader>
                <SectionHeader title="4. 자재 사양" color="purple" />
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 자재 층수 선택 */}
                <FormField
                  control={form.control}
                  name="materialLayers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>자재 층수</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger onKeyDown={(e) => handleSelectKeyDown(e, field.onChange)}>
                            <SelectValue placeholder="층수 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((layer) => (
                            <SelectItem key={layer} value={layer.toString()}>
                              {layer}층
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 각 층별 자재 선택 */}
                {Array.from({ length: parseInt(form.watch("materialLayers") || "1") }, (_, index) => (
                  <div key={index} className="border p-4 rounded-lg">
                    <h4 className="font-medium mb-3">{index + 1}층 자재</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`layer${index + 1}MaterialId` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>자재 선택</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger onKeyDown={(e) => handleSelectKeyDown(e, field.onChange)}>
                                  <SelectValue placeholder="자재 선택" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {materials?.map((material: any) => (
                                  <SelectItem key={material.id} value={material.id.toString()}>
                                    {material.name} - {material.thickness}μm
                                  </SelectItem>
                                ))}
                                <SelectItem value="기타">기타</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {form.watch(`layer${index + 1}MaterialId` as any) === "기타" && (
                        <FormItem>
                          <FormLabel>자재명 직접 입력</FormLabel>
                          <FormControl>
                            <Input placeholder="자재명을 입력하세요" />
                          </FormControl>
                        </FormItem>
                      )}
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="thickness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>총 두께 (μm)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="총 두께" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>색상</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="색상" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 5. 인쇄사양 */}
            <Card>
              <CardHeader>
                <SectionHeader title="5. 인쇄사양" color="red" />
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="specialColorCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>별색수</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger onKeyDown={(e) => handleSelectKeyDown(e, field.onChange)}>
                            <SelectValue placeholder="별색수 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}색
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PANTONE 컬러 입력 필드 */}
                {pantoneColors.length > 0 && (
                  <div className="space-y-2">
                    <FormLabel>PANTONE 컬러</FormLabel>
                    {pantoneColors.map((color, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={color}
                          onChange={(e) => {
                            const newColors = [...pantoneColors];
                            newColors[index] = e.target.value;
                            setPantoneColors(newColors);
                          }}
                          placeholder={`PANTONE 컬러 ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 인쇄 방법 */}
                <FormField
                  control={form.control}
                  name="printMethods"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>인쇄 방법</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {["오프셋", "플렉소", "실크스크린", "디지털", "그라비아", "CMYK", "후지배면I마크", "기타"].map((method) => (
                          <div key={method} className="flex items-center space-x-2">
                            <Checkbox
                              id={method}
                              checked={field.value?.includes(method) || false}
                              onCheckedChange={(checked) => {
                                const currentMethods = field.value || [];
                                if (checked) {
                                  field.onChange([...currentMethods, method]);
                                } else {
                                  field.onChange(currentMethods.filter((m) => m !== method));
                                }
                              }}
                            />
                            <label htmlFor={method} className="text-sm font-medium">
                              {method}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 인쇄 방법 기타 직접 입력 */}
                {form.watch("printMethods")?.includes("기타") && (
                  <FormItem>
                    <FormLabel>기타 인쇄 방법 직접 입력</FormLabel>
                    <FormControl>
                      <Input placeholder="기타 인쇄 방법을 입력하세요" />
                    </FormControl>
                  </FormItem>
                )}

                {/* 특수 인쇄 - 열박 */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="useHotStamping"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>열박 (Hot Stamping) 사용</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("useHotStamping") && (
                    <FormField
                      control={form.control}
                      name="hotStampingMaterial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>열박 자재 선택</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger onKeyDown={(e) => handleSelectKeyDown(e, field.onChange)}>
                                <SelectValue placeholder="열박 자재 선택" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {materials?.filter((m: any) => m.category === "열박")?.map((material: any) => (
                                <SelectItem key={material.id} value={material.name}>
                                  {material.name}
                                </SelectItem>
                              ))}
                              <SelectItem value="기타">기타</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("useHotStamping") && form.watch("hotStampingMaterial") === "기타" && (
                    <FormItem>
                      <FormLabel>열박 기타 직접 입력</FormLabel>
                      <FormControl>
                        <Input placeholder="열박 자재명 직접 입력" />
                      </FormControl>
                    </FormItem>
                  )}
                </div>

                {/* 특수 인쇄 - 콜드박 */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="useColdStamping"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>콜드박 (Cold Stamping) 사용</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("useColdStamping") && (
                    <FormField
                      control={form.control}
                      name="coldStampingMaterial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>콜드박 자재 선택</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger onKeyDown={(e) => handleSelectKeyDown(e, field.onChange)}>
                                <SelectValue placeholder="콜드박 자재 선택" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {materials?.filter((m: any) => m.category === "콜드박")?.map((material: any) => (
                                <SelectItem key={material.id} value={material.name}>
                                  {material.name}
                                </SelectItem>
                              ))}
                              <SelectItem value="기타">기타</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("useColdStamping") && form.watch("coldStampingMaterial") === "기타" && (
                    <FormItem>
                      <FormLabel>콜드박 기타 직접 입력</FormLabel>
                      <FormControl>
                        <Input placeholder="콜드박 자재명 직접 입력" />
                      </FormControl>
                    </FormItem>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 6. 후가공 */}
            <Card>
              <CardHeader>
                <SectionHeader title="6. 후가공" color="indigo" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="uvCoatingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UV 코팅</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger onKeyDown={(e) => handleSelectKeyDown(e, field.onChange)}>
                              <SelectValue placeholder="UV 코팅 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="없음">없음</SelectItem>
                            <SelectItem value="유광">유광</SelectItem>
                            <SelectItem value="무광">무광</SelectItem>
                            <SelectItem value="기타">기타</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch("uvCoatingType") === "기타" && (
                    <FormItem>
                      <FormLabel>UV 코팅 기타 직접 입력</FormLabel>
                      <FormControl>
                        <Input placeholder="UV 코팅 상세 내용을 입력하세요" />
                      </FormControl>
                    </FormItem>
                  )}
                  {(form.watch("uvCoatingType") === "유광" || form.watch("uvCoatingType") === "무광") && (
                    <FormField
                      control={form.control}
                      name="uvCoatingDetail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UV 코팅 세부 옵션</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            {["일반용", "리본착인용"].map((type) => (
                              <div key={type} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`uv-detail-${type}`}
                                  checked={field.value?.includes(type) || false}
                                  onCheckedChange={(checked) => {
                                    const currentTypes = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentTypes, type]);
                                    } else {
                                      field.onChange(currentTypes.filter((t) => t !== type));
                                    }
                                  }}
                                />
                                <label htmlFor={`uv-detail-${type}`} className="text-sm font-medium">
                                  {type}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="laminatingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>라미네이팅</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger onKeyDown={(e) => handleSelectKeyDown(e, field.onChange)}>
                              <SelectValue placeholder="라미네이팅 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="없음">없음</SelectItem>
                            <SelectItem value="유광">유광</SelectItem>
                            <SelectItem value="무광">무광</SelectItem>
                            <SelectItem value="기타">기타</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch("laminatingType") === "기타" && (
                    <FormItem>
                      <FormLabel>라미네이팅 기타 직접 입력</FormLabel>
                      <FormControl>
                        <Input placeholder="라미네이팅 상세 내용을 입력하세요" />
                      </FormControl>
                    </FormItem>
                  )}
                  {(form.watch("laminatingType") === "유광" || form.watch("laminatingType") === "무광") && (
                    <FormField
                      control={form.control}
                      name="laminatingDetail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>라미네이팅 세부 옵션</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            {["일반용", "리본착인용"].map((type) => (
                              <div key={type} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`lam-detail-${type}`}
                                  checked={field.value?.includes(type) || false}
                                  onCheckedChange={(checked) => {
                                    const currentTypes = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentTypes, type]);
                                    } else {
                                      field.onChange(currentTypes.filter((t) => t !== type));
                                    }
                                  }}
                                />
                                <label htmlFor={`lam-detail-${type}`} className="text-sm font-medium">
                                  {type}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cuttingMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>다이컷 방법</FormLabel>
                        <Select onValueChange={(value) => {
                          if (value !== "하프컷(Half Cut)") {
                            if (window.confirm("하프컷 이외의 다이컷 방법에 대해 정확히 확인하셨습니까?\n다른 방법의 경우 별도 비용이 추가 되거나 반복작업이 될 수 있습니다.")) {
                              field.onChange(value);
                            } else {
                              return;
                            }
                          } else {
                            field.onChange(value);
                          }
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger onKeyDown={(e) => handleSelectKeyDown(e, field.onChange)}>
                              <SelectValue placeholder="다이컷 방법 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="하프컷(Half Cut)">하프컷(Half Cut)</SelectItem>
                            <SelectItem value="타발">타발</SelectItem>
                            <SelectItem value="레이저컷팅">레이저컷팅</SelectItem>
                            <SelectItem value="기타">기타</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch("cuttingMethod") === "기타" && (
                    <FormItem>
                      <FormLabel>다이컷 방법 기타 직접 입력</FormLabel>
                      <FormControl>
                        <Input placeholder="다이컷 방법을 입력하세요" />
                      </FormControl>
                    </FormItem>
                  )}
                  <FormField
                    control={form.control}
                    name="cuttingPrecision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>가공 정밀도</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger onKeyDown={(e) => handleSelectKeyDown(e, field.onChange)}>
                              <SelectValue placeholder="정밀도 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="±0.1mm">±0.1mm</SelectItem>
                            <SelectItem value="±0.2mm">±0.2mm</SelectItem>
                            <SelectItem value="±0.3mm">±0.3mm</SelectItem>
                            <SelectItem value="±0.5mm">±0.5mm</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 7. 품질 기준 및 검사 */}
            <Card>
              <CardHeader>
                <SectionHeader title="7. 품질 기준 및 검사" color="pink" />
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 검사 항목 (섹션 최상단으로 이동) */}
                <FormField
                  control={form.control}
                  name="inspectionItems"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>검사 항목</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {["치수", "색상", "색차관리", "인쇄품질", "인쇄박리(테이프)", "접착력", "내구성", "기타"].map((item) => (
                          <div key={item} className="flex items-center space-x-2">
                            <Checkbox
                              id={item}
                              checked={field.value?.includes(item) || false}
                              onCheckedChange={(checked) => {
                                const currentItems = field.value || [];
                                if (checked) {
                                  field.onChange([...currentItems, item]);
                                } else {
                                  field.onChange(currentItems.filter((i) => i !== item));
                                }
                              }}
                            />
                            <label htmlFor={item} className="text-sm font-medium">
                              {item}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 기타 검사 항목 직접 입력 */}
                {showCustomInspection && (
                  <div className="space-y-2">
                    <FormLabel>기타 검사 항목</FormLabel>
                    {customInspectionItems.map((item, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={item}
                          onChange={(e) => {
                            const newItems = [...customInspectionItems];
                            newItems[index] = e.target.value;
                            setCustomInspectionItems(newItems);
                          }}
                          placeholder={`검사 항목 ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newItems = [...customInspectionItems];
                            newItems.splice(index, 1);
                            setCustomInspectionItems(newItems);
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomInspectionItems([...customInspectionItems, ""])}
                    >
                      <Plus className="h-4 w-4" />
                      검사 항목 추가
                    </Button>
                  </div>
                )}

                {/* 색차 기준 - 색차관리 검사 항목 선택 시에만 활성화 */}
                {form.watch("inspectionItems")?.includes("색차관리") && (
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="colorDifferenceStandard"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>색차 기준</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger onKeyDown={(e) => handleSelectKeyDown(e, field.onChange)}>
                                <SelectValue placeholder="색차 기준 선택" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ΔE*ab">ΔE*ab</SelectItem>
                              <SelectItem value="ΔE*00">ΔE*00</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="colorDifferenceValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>색차값</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              value={field.value || ""}
                              placeholder="색차값" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="qualityGrade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>품질 등급</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger onKeyDown={(e) => handleSelectKeyDown(e, field.onChange)}>
                                <SelectValue placeholder="품질 등급 선택" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="최고급">최고급 (1.5)</SelectItem>
                              <SelectItem value="고급">고급 (2.0)</SelectItem>
                              <SelectItem value="일반">일반 (2.5)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 8. 기타 정보 */}
            <Card>
              <CardHeader>
                <SectionHeader title="8. 기타 정보" color="gray" />
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>특이사항</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="기타 특이사항을 입력하세요" rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "생성 중..." : "라벨 생성"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}