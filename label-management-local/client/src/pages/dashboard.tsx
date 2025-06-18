import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-inter">대시보드</h2>
            <p className="text-sm text-gray-600 mt-1">라벨메이트 관리 현황을 확인하세요</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <i className="fas fa-chart-line text-4xl text-primary-500 mb-4"></i>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">대시보드 준비 중</h3>
              <p className="text-gray-600">
                라벨메이트 통합 관리 시스템의 대시보드가 곧 제공됩니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
