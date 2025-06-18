import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { insertLabelLibrarySchema, LabelLibrary } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertLabelLibrarySchema;

type FormData = z.infer<typeof formSchema>;

interface LabelLibraryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem?: LabelLibrary | null;
}

export function LabelLibraryFormModal({
  open,
  onOpenChange,
  editingItem,
}: LabelLibraryFormModalProps) {
  const { toast } = useToast();
  const [currentTag, setCurrentTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      labelName: "",
      labelTypes: [],
      printMethods: [],
      finishingMethods: [],
      tags: [],
      isActive: true,
    },
  });

  useEffect(() => {
    if (editingItem) {
      form.reset({
        labelName: editingItem.labelName,
        labelTypes: editingItem.labelTypes || [],
        printMethods: editingItem.printMethods || [],
        finishingMethods: editingItem.finishingMethods || [],
        tags: editingItem.tags || [],
        isActive: editingItem.isActive,
        description: editingItem.description || "",
        specifications: editingItem.specifications || "",
        materialType: editingItem.materialType || "",
        adhesiveType: editingItem.adhesiveType || "",
        printingMethod: editingItem.printingMethod || "",
        finishingMethod: editingItem.finishingMethod || "",
        minOrderQuantity: editingItem.minOrderQuantity || undefined,
        unitPrice: editingItem.unitPrice || undefined,
        leadTime: editingItem.leadTime || undefined,
        qualityStandards: editingItem.qualityStandards || "",
        certifications: editingItem.certifications || "",
        applications: editingItem.applications || "",
        storageConditions: editingItem.storageConditions || "",
        shelfLife: editingItem.shelfLife || "",
        color: editingItem.color || "",
        size: editingItem.size || "",
        thickness: editingItem.thickness || "",
        opacity: editingItem.opacity || "",
        glossLevel: editingItem.glossLevel || "",
        temperature: editingItem.temperature || "",
        chemicalResistance: editingItem.chemicalResistance || "",
        waterResistance: editingItem.waterResistance || "",
        uvResistance: editingItem.uvResistance || "",
        printQuality: editingItem.printQuality || "",
        adhesionStrength: editingItem.adhesionStrength || "",
        durability: editingItem.durability || "",
        removability: editingItem.removability || "",
        repositionability: editingItem.repositionability || "",
        sustainability: editingItem.sustainability || "",
        notes: editingItem.notes || "",
      });
    } else {
      form.reset({
        labelName: "",
        labelTypes: [],
        printMethods: [],
        finishingMethods: [],
        tags: [],
        isActive: true,
      });
    }
  }, [editingItem, form]);

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await apiRequest(`/api/label-library/${editingItem.id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
        toast({
          title: "성공",
          description: "라벨 라이브러리 항목이 수정되었습니다.",
        });
      } else {
        await apiRequest("/api/label-library", {
          method: "POST",
          body: JSON.stringify(data),
        });
        toast({
          title: "성공",
          description: "라벨 라이브러리 항목이 생성되었습니다.",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/label-library"] });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "오류",
        description: "작업 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (currentTag.trim()) {
      const currentTags = form.getValues("tags") || [];
      if (!currentTags.includes(currentTag.trim())) {
        form.setValue("tags", [...currentTags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const addToArray = (fieldName: keyof FormData, value: string) => {
    const currentValues = form.getValues(fieldName) as string[] || [];
    if (!currentValues.includes(value)) {
      form.setValue(fieldName, [...currentValues, value] as any);
    }
  };

  const removeFromArray = (fieldName: keyof FormData, valueToRemove: string) => {
    const currentValues = form.getValues(fieldName) as string[] || [];
    form.setValue(fieldName, currentValues.filter(v => v !== valueToRemove) as any);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "라벨 라이브러리 수정" : "라벨 라이브러리 생성"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">기본 정보</TabsTrigger>
              <TabsTrigger value="materials">소재/재질</TabsTrigger>
              <TabsTrigger value="printing">인쇄</TabsTrigger>
              <TabsTrigger value="finishing">가공/후처리</TabsTrigger>
              <TabsTrigger value="quality">품질 기준</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="labelName">라벨명 *</Label>
                  <Input
                    id="labelName"
                    {...form.register("labelName")}
                    placeholder="라벨명을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="color">색상</Label>
                  <Input
                    id="color"
                    {...form.register("color")}
                    placeholder="색상을 입력하세요"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="라벨에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div>
                <Label>라벨 유형</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.watch("labelTypes")?.map((type) => (
                    <Badge key={type} variant="secondary" className="flex items-center gap-1">
                      {type}
                      <X
                        size={12}
                        className="cursor-pointer"
                        onClick={() => removeFromArray("labelTypes", type)}
                      />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={(value) => addToArray("labelTypes", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="라벨 유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="스티커">스티커</SelectItem>
                    <SelectItem value="라벨">라벨</SelectItem>
                    <SelectItem value="바코드">바코드</SelectItem>
                    <SelectItem value="QR코드">QR코드</SelectItem>
                    <SelectItem value="홀로그램">홀로그램</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>태그</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.watch("tags")?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        size={12}
                        className="cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="태그를 입력하세요"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag}>추가</Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) => form.setValue("isActive", checked as boolean)}
                />
                <Label htmlFor="isActive">활성 상태</Label>
              </div>
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="materialType">소재 유형</Label>
                  <Input
                    id="materialType"
                    {...form.register("materialType")}
                    placeholder="소재 유형을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="adhesiveType">접착제 유형</Label>
                  <Input
                    id="adhesiveType"
                    {...form.register("adhesiveType")}
                    placeholder="접착제 유형을 입력하세요"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="size">크기</Label>
                  <Input
                    id="size"
                    {...form.register("size")}
                    placeholder="크기를 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="thickness">두께</Label>
                  <Input
                    id="thickness"
                    {...form.register("thickness")}
                    placeholder="두께를 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="opacity">투명도</Label>
                  <Input
                    id="opacity"
                    {...form.register("opacity")}
                    placeholder="투명도를 입력하세요"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="specifications">규격 사양</Label>
                <Textarea
                  id="specifications"
                  {...form.register("specifications")}
                  placeholder="규격 사양을 입력하세요"
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="printing" className="space-y-4">
              <div>
                <Label htmlFor="printingMethod">인쇄 방법</Label>
                <Input
                  id="printingMethod"
                  {...form.register("printingMethod")}
                  placeholder="인쇄 방법을 입력하세요"
                />
              </div>

              <div>
                <Label>인쇄 방식</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.watch("printMethods")?.map((method) => (
                    <Badge key={method} variant="secondary" className="flex items-center gap-1">
                      {method}
                      <X
                        size={12}
                        className="cursor-pointer"
                        onClick={() => removeFromArray("printMethods", method)}
                      />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={(value) => addToArray("printMethods", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="인쇄 방식을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="디지털">디지털</SelectItem>
                    <SelectItem value="오프셋">오프셋</SelectItem>
                    <SelectItem value="플렉소">플렉소</SelectItem>
                    <SelectItem value="스크린">스크린</SelectItem>
                    <SelectItem value="그라비어">그라비어</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="printQuality">인쇄 품질</Label>
                <Input
                  id="printQuality"
                  {...form.register("printQuality")}
                  placeholder="인쇄 품질을 입력하세요"
                />
              </div>
            </TabsContent>

            <TabsContent value="finishing" className="space-y-4">
              <div>
                <Label htmlFor="finishingMethod">후처리 방법</Label>
                <Input
                  id="finishingMethod"
                  {...form.register("finishingMethod")}
                  placeholder="후처리 방법을 입력하세요"
                />
              </div>

              <div>
                <Label>후처리 방식</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.watch("finishingMethods")?.map((method) => (
                    <Badge key={method} variant="secondary" className="flex items-center gap-1">
                      {method}
                      <X
                        size={12}
                        className="cursor-pointer"
                        onClick={() => removeFromArray("finishingMethods", method)}
                      />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={(value) => addToArray("finishingMethods", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="후처리 방식을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UV코팅">UV코팅</SelectItem>
                    <SelectItem value="라미네이팅">라미네이팅</SelectItem>
                    <SelectItem value="엠보싱">엠보싱</SelectItem>
                    <SelectItem value="디보싱">디보싱</SelectItem>
                    <SelectItem value="박">박</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="glossLevel">광택도</Label>
                  <Input
                    id="glossLevel"
                    {...form.register("glossLevel")}
                    placeholder="광택도를 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="durability">내구성</Label>
                  <Input
                    id="durability"
                    {...form.register("durability")}
                    placeholder="내구성을 입력하세요"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quality" className="space-y-4">
              <div>
                <Label htmlFor="qualityStandards">품질 기준</Label>
                <Textarea
                  id="qualityStandards"
                  {...form.register("qualityStandards")}
                  placeholder="품질 기준을 입력하세요"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="certifications">인증</Label>
                <Input
                  id="certifications"
                  {...form.register("certifications")}
                  placeholder="인증을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="waterResistance">내수성</Label>
                  <Input
                    id="waterResistance"
                    {...form.register("waterResistance")}
                    placeholder="내수성을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="uvResistance">내UV성</Label>
                  <Input
                    id="uvResistance"
                    {...form.register("uvResistance")}
                    placeholder="내UV성을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">온도 조건</Label>
                  <Input
                    id="temperature"
                    {...form.register("temperature")}
                    placeholder="온도 조건을 입력하세요"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sustainability">지속가능성</Label>
                <Textarea
                  id="sustainability"
                  {...form.register("sustainability")}
                  placeholder="지속가능성에 대해 입력하세요"
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : editingItem ? "수정" : "생성"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}