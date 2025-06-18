import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Package, Users, FileText, AlertCircle } from "lucide-react";
import { DateRange } from "react-day-picker";

interface ReportData {
  orderStats: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    monthlyTrend: Array<{ month: string; orders: number; revenue: number }>;
  };
  customerStats: {
    total: number;
    active: number;
    topCustomers: Array<{ name: string; orderCount: number; revenue: number }>;
  };
  materialUsage: Array<{ name: string; usage: number; cost: number }>;
  qualityMetrics: {
    passRate: number;
    commonIssues: Array<{ issue: string; count: number }>;
  };
}

export default function Reports() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [reportType, setReportType] = useState<string>("overview");

  const { data: reportData, isLoading } = useQuery<ReportData>({
    queryKey: ['/api/reports', reportType, dateRange],
    enabled: true
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">데이터를 불러오는 중...</div>
      </div>
    );
  }

  const orderStatusData = reportData ? [
    { name: '완료', value: reportData.orderStats.completed, color: '#00C49F' },
    { name: '진행중', value: reportData.orderStats.inProgress, color: '#FFBB28' },
    { name: '대기중', value: reportData.orderStats.pending, color: '#FF8042' }
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">통합 보고서 및 데이터 시각화</h1>
        <div className="flex space-x-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="보고서 유형 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">전체 개요</SelectItem>
              <SelectItem value="orders">주문 분석</SelectItem>
              <SelectItem value="customers">고객 분석</SelectItem>
              <SelectItem value="materials">자재 분석</SelectItem>
              <SelectItem value="quality">품질 분석</SelectItem>
            </SelectContent>
          </Select>
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            보고서 내보내기
          </Button>
        </div>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 주문 수</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.orderStats.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              전월 대비 +12%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 고객</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.customerStats.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              전월 대비 +8%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">품질 통과율</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.qualityMetrics.passRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline w-3 h-3 mr-1" />
              전월 대비 -2%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">월간 매출</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩2,450,000</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              전월 대비 +15%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 주문 상태 분포 */}
        <Card>
          <CardHeader>
            <CardTitle>주문 상태 분포</CardTitle>
            <CardDescription>현재 주문들의 상태별 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 월별 주문 트렌드 */}
        <Card>
          <CardHeader>
            <CardTitle>월별 주문 트렌드</CardTitle>
            <CardDescription>최근 6개월간 주문 추이</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData?.orderStats.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 자재 사용량 */}
        <Card>
          <CardHeader>
            <CardTitle>자재 사용량</CardTitle>
            <CardDescription>주요 자재별 사용량 및 비용</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData?.materialUsage || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 주요 고객 */}
        <Card>
          <CardHeader>
            <CardTitle>주요 고객</CardTitle>
            <CardDescription>매출 기준 상위 고객</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData?.customerStats.topCustomers || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 품질 이슈 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>품질 이슈 현황</CardTitle>
          <CardDescription>자주 발생하는 품질 문제들</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData?.qualityMetrics.commonIssues?.map((issue, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{issue.issue}</h4>
                  <p className="text-sm text-muted-foreground">발생 횟수: {issue.count}회</p>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(issue.count / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}