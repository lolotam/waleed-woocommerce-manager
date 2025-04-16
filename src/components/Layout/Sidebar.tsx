
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';
import { brandsApi, categoriesApi } from '@/utils/api';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  ShoppingBag, 
  FileSpreadsheet, 
  MessageSquare, 
  Settings, 
  Info, 
  FileText,
  Upload,
  BarChart,
  Bot,
  Tags,
  Globe,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const isMobile = useIsMobile();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  // Fetch categories count
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-count'],
    queryFn: async () => {
      const response = await categoriesApi.getAll({ per_page: "1" });
      return response.headers?.['x-wp-total'] ? parseInt(response.headers['x-wp-total']) : 0;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch brands count
  const { data: brandsData } = useQuery({
    queryKey: ['brands-count'],
    queryFn: async () => {
      const response = await brandsApi.getAll({ per_page: "1" });
      return response.headers?.['x-wp-total'] ? parseInt(response.headers['x-wp-total']) : 0;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const categoriesCount = categoriesData || 0;
  const brandsCount = brandsData || 0;

  const navItems = [
    { 
      id: 'dashboard',
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/' 
    },
    { 
      id: 'products',
      icon: Package, 
      label: 'Products', 
      path: '/products',
      subItems: [
        { label: 'Bulk Product SEO', path: '/bulk-product-seo' }
      ]
    },
    { 
      id: 'categories',
      icon: Tag, 
      label: `Categories ${categoriesCount ? `(${categoriesCount})` : ''}`, 
      path: '/categories',
      subItems: [
        { label: 'Logo Uploader', path: '/brand-logo-uploader' }
      ]
    },
    { id: 'brands', icon: Tags, label: `Brands ${brandsCount ? `(${brandsCount})` : ''}`, path: '/brands' },
    { id: 'import', icon: FileSpreadsheet, label: 'Import/Export', path: '/import-export' },
    { id: 'prompts', icon: MessageSquare, label: 'Prompts', path: '/prompts' },
    { 
      id: 'web-tools',
      icon: Globe, 
      label: 'Web Tools', 
      path: '/web-tools',
      subItems: [
        { label: 'Web Scraper', path: '/scraper' },
        { label: 'Web Performance', path: '/web-performance' }
      ]
    },
    { id: 'logs', icon: FileText, label: 'Logs', path: '/logs' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
    { id: 'about', icon: Info, label: 'About', path: '/about' },
  ];

  const toggleSubItems = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Close sidebar when clicking a link on mobile
  const handleNavLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 bottom-0 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out z-30 pt-16 overflow-hidden",
        isOpen ? "w-64" : "w-0 md:w-20",
        isMobile && !isOpen && "w-0"
      )}>
        <div className="flex flex-col p-4 flex-grow overflow-y-auto">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item.path} className="flex flex-col">
                <div className="flex items-center">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors flex-grow",
                      isOpen ? "justify-start" : "justify-center",
                      isActive && !item.subItems 
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    )}
                    end={!!item.subItems}
                    onClick={handleNavLinkClick}
                  >
                    <item.icon className={cn("flex-shrink-0", 
                      isOpen ? "mr-3 h-5 w-5" : "h-6 w-6"
                    )} />
                    {isOpen && <span className="truncate">{item.label}</span>}
                  </NavLink>
                  
                  {/* Expand/Collapse button for items with subitems */}
                  {isOpen && item.subItems && (
                    <button
                      onClick={() => toggleSubItems(item.id)}
                      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                      aria-label={expandedItems[item.id] ? "Collapse section" : "Expand section"}
                    >
                      {expandedItems[item.id] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
                
                {/* Render sub-items if they exist and the sidebar is expanded */}
                {isOpen && item.subItems && expandedItems[item.id] && (
                  <div className="ml-9 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path}
                        className={({ isActive }) => cn(
                          "flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors",
                          isActive 
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        )}
                        onClick={handleNavLinkClick}
                      >
                        <span className="truncate">{subItem.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
