import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "대시보드",
    href: "/",
    icon: "fas fa-home",
  },
  {
    category: "주문 관리",
    items: [
      {
        name: "주문 접수",
        href: "/orders",
        icon: "fas fa-clipboard-list",
        badge: 12,
      },
      {
        name: "진행 관리",
        href: "/orders/progress",
        icon: "fas fa-tasks",
      },
    ],
  },
  {
    category: "라이브러리",
    items: [
      {
        name: "라벨 라이브러리",
        href: "/label-library",
        icon: "fas fa-tags",
      },
      {
        name: "자재 라이브러리",
        href: "/materials",
        icon: "fas fa-database",
      },
      {
        name: "재고 관리",
        href: "/inventory",
        icon: "fas fa-warehouse",
      },
      {
        name: "발주 관리",
        href: "/purchase-orders",
        icon: "fas fa-shopping-cart",
      },
    ],
  },
  {
    category: "생산 관리",
    items: [
      {
        name: "외주업체 관리",
        href: "/vendors",
        icon: "fas fa-industry",
      },
      {
        name: "품질 관리",
        href: "/quality",
        icon: "fas fa-clipboard-check",
      },
      {
        name: "입출고 관리",
        href: "/inventory-movements",
        icon: "fas fa-truck",
      },
    ],
  },
  {
    category: "문서 관리",
    items: [
      {
        name: "견적서",
        href: "/documents/quotes",
        icon: "fas fa-file-alt",
      },
      {
        name: "성적서",
        href: "/documents/certificates",
        icon: "fas fa-certificate",
      },
      {
        name: "거래명세표",
        href: "/documents/statements",
        icon: "fas fa-receipt",
      },
      {
        name: "라벨 출력",
        href: "/documents/labels",
        icon: "fas fa-print",
      },
    ],
  },
  {
    category: "분석 및 보고서",
    items: [
      {
        name: "통합 보고서",
        href: "/reports",
        icon: "fas fa-chart-bar",
      },
      {
        name: "데이터 시각화",
        href: "/reports?type=visualization",
        icon: "fas fa-chart-pie",
      },
    ],
  },
  {
    category: "설정",
    items: [
      {
        name: "고객사 관리",
        href: "/customers",
        icon: "fas fa-users",
      },
      {
        name: "시스템 설정",
        href: "/settings",
        icon: "fas fa-cog",
      },
    ],
  },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <i className="fas fa-tags text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-inter">라벨메이트</h1>
            <p className="text-sm text-gray-500">Label Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {typeof section.name === "string" ? (
              // Single item
              <Link href={section.href!}>
                <a
                  className={cn(
                    "flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors",
                    location === section.href && "bg-primary-50 text-primary-600"
                  )}
                >
                  <i className={cn(section.icon, "w-5 h-5 mr-3")}></i>
                  <span className="font-medium">{section.name}</span>
                </a>
              </Link>
            ) : (
              // Category with items
              <>
                <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {section.category}
                </h3>
                <div className="space-y-1">
                  {section.items?.map((item, itemIndex) => (
                    <Link key={itemIndex} href={item.href}>
                      <a
                        className={cn(
                          "flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors",
                          location === item.href && "bg-primary-50 text-primary-600"
                        )}
                      >
                        <i className={cn(item.icon, "w-4 h-4 mr-3")}></i>
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="ml-auto bg-primary-100 text-primary-600 text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <i className="fas fa-user text-white text-sm"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">관리자</p>
            <p className="text-xs text-gray-500">admin@labelmate.com</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
