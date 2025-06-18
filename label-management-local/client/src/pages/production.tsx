import { Card, CardContent } from "@/components/ui/card";

export default function Production() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-inter">생산 관리</h2>
            <p className="text-sm text-gray-600 mt-1">외주업체 및 품질 관리를 진행합니다</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <i className="fas fa-industry text-4xl text-primary-500 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">생산 관리 기능 준비 중</h3>
            <p className="text-gray-600">
              외주업체 관리 및 품질 관리 기능이 곧 제공됩니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
