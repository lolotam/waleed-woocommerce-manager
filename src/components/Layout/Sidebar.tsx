
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from "@/lib/utils";
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
  Globe
} from "lucide-react";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);

  const navItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/' 
    },
    { 
      icon: Package, 
      label: 'Products', 
      path: '/products',
      subItems: [
        { label: 'Bulk Product SEO', path: '/bulk-product-seo' }
      ]
    },
    { 
      icon: Tag, 
      label: 'Categories', 
      path: '/categories',
      subItems: [
        { label: 'Logo Uploader', path: '/brand-logo-uploader' }
      ]
    },
    { icon: Tags, label: 'Brands', path: '/brands' },
    { icon: FileSpreadsheet, label: 'Import/Export', path: '/import-export' },
    { icon: MessageSquare, label: 'Prompts', path: '/prompts' },
    { 
      icon: Globe, 
      label: 'Web Tools', 
      path: '/web-tools',
      subItems: [
        { label: 'Web Scraper', path: '/scraper' },
        { label: 'Web Performance', path: '/web-performance' }
      ]
    },
    { icon: FileText, label: 'Logs', path: '/logs' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: Info, label: 'About', path: '/about' },
  ];

  return (
    <aside className={cn(
      "h-screen fixed left-0 top-0 bottom-0 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out z-30 pt-16",
      expanded ? "w-64" : "w-20"
    )}>
      <div className="flex flex-col p-4 flex-grow overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <div key={item.path} className="flex flex-col">
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  expanded ? "justify-start" : "justify-center",
                  isActive && !item.subItems 
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
                end={!!item.subItems}
              >
                <item.icon className={cn("flex-shrink-0", 
                  expanded ? "mr-3 h-5 w-5" : "h-6 w-6"
                )} />
                {expanded && <span>{item.label}</span>}
              </NavLink>
              
              {/* Render sub-items if they exist and the sidebar is expanded */}
              {expanded && item.subItems && (
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
                    >
                      <span>{subItem.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="w-full flex items-center justify-center p-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
