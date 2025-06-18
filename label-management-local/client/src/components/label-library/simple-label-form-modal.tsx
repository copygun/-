import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LabelLibrary } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SimpleLabelFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem?: LabelLibrary | null;
}

export function SimpleLabelFormModal({
  open,
  onOpenChange,
  editingItem,
}: SimpleLabelFormModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      labelName: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (editingItem) {
      form.reset({
        labelName: editingItem.labelName,
        description: editingItem.description || "",
        isActive: editingItem.isActive,
      });
    } else {
      form.reset({
        labelName: "",
        description: "",
        isActive: true,
      });
    }
  }, [editingItem, form]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await fetch(`/api/label-library/${editingItem.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        toast({
          title: "성공",
          description: "라벨 라이브러리 항목이 수정되었습니다.",
        });
      } else {
        await fetch("/api/label-library", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "라벨 라이브러리 수정" : "라벨 라이브러리 생성"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="labelName">라벨명 *</Label>
            <Input
              id="labelName"
              {...form.register("labelName", { required: true })}
              placeholder="라벨명을 입력하세요"
            />
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={form.watch("isActive")}
              onCheckedChange={(checked) => form.setValue("isActive", checked as boolean)}
            />
            <Label htmlFor="isActive">활성 상태</Label>
          </div>

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