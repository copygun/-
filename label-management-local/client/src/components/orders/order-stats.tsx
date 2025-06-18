import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface OrderStats {
  newOrders: number;
  inProgress: number;
  completed: number;
  totalRevenue: number;
}

export function OrderStats() {
  const { data: stats, isLoading } = useQuery<OrderStats>({
    queryKey: ["/api/orders/stats"],
  });

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: "신규 주문",
      value: stats.newOrders,
      change: "+23% 전월 대비",
      changeType: "positive" as const,
      icon: "fas fa-clipboard-list",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "진행 중",
      value: stats.inProgress,
      change: "평균 5일 소요",
      changeType: "neutral" as const,
      icon: "fas fa-hourglass-half",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      label: "완료",
      value: stats.completed,
      change: "이번 달",
      changeType: "positive" as const,
      icon: "fas fa-check-circle",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "매출액",
      value: formatCurrency(stats.totalRevenue),
      change: "+15% 전월 대비",
      changeType: "positive" as const,
      icon: "fas fa-chart-line",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => (
        <Card key={index} className="bg-white rounded-xl shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {typeof item.value === "string" ? item.value : item.value.toLocaleString()}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    item.changeType === "positive"
                      ? "text-green-600"
                      : item.changeType === "negative"
                      ? "text-red-600"
                      : "text-orange-600"
                  }`}
                >
                  <i
                    className={`mr-1 ${
                      item.changeType === "positive"
                        ? "fas fa-arrow-up"
                        : item.changeType === "negative"
                        ? "fas fa-arrow-down"
                        : "fas fa-clock"
                    }`}
                  ></i>
                  {item.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${item.iconBg} rounded-lg flex items-center justify-center`}>
                <i className={`${item.icon} ${item.iconColor} text-xl`}></i>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
