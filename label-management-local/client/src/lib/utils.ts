import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (!amount) return "₩0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateDaysUntil(date: string | Date | null | undefined): {
  days: number;
  status: "overdue" | "urgent" | "warning" | "ok";
  text: string;
} {
  if (!date) return { days: 0, status: "ok", text: "" };
  
  const target = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { days: Math.abs(diffDays), status: "overdue", text: `${Math.abs(diffDays)}일 지연` };
  } else if (diffDays === 0) {
    return { days: 0, status: "urgent", text: "오늘 마감" };
  } else if (diffDays <= 3) {
    return { days: diffDays, status: "urgent", text: `D-${diffDays}` };
  } else if (diffDays <= 7) {
    return { days: diffDays, status: "warning", text: `D-${diffDays}` };
  } else {
    return { days: diffDays, status: "ok", text: "여유" };
  }
}

export function getStatusColor(status: string): {
  bgColor: string;
  textColor: string;
  icon: string;
} {
  switch (status) {
    case "pending":
      return {
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        icon: "fas fa-clock",
      };
    case "processing":
      return {
        bgColor: "bg-orange-100",
        textColor: "text-orange-800",
        icon: "fas fa-hourglass-half",
      };
    case "completed":
      return {
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        icon: "fas fa-check-circle",
      };
    case "cancelled":
      return {
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        icon: "fas fa-times-circle",
      };
    default:
      return {
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
        icon: "fas fa-question-circle",
      };
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case "pending":
      return "접수 대기";
    case "processing":
      return "진행 중";
    case "completed":
      return "완료";
    case "cancelled":
      return "취소";
    default:
      return status;
  }
}
