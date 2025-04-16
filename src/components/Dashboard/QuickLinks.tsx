
import { Link } from "react-router-dom";
import { 
  ShoppingBag, 
  Tags, 
  Folder, 
  Upload, 
  ListFilter, 
  MessageSquareText,
  FileSpreadsheet,
  UploadIcon,
  BarChart,
  Bot,
  FileText
} from "lucide-react";

const links = [
  {
    title: "Products",
    description: "Manage your product catalog",
    icon: <ShoppingBag className="h-8 w-8" />,
    href: "/products",
  },
  {
    title: "Categories",
    description: "Organize products with categories",
    icon: <Folder className="h-8 w-8" />,
    href: "/categories",
  },
  {
    title: "Brands",
    description: "Manage product brands",
    icon: <Tags className="h-8 w-8" />,
    href: "/brands",
  },
  {
    title: "Import & Export",
    description: "Import or export product data",
    icon: <FileSpreadsheet className="h-8 w-8" />,
    href: "/import-export",
  },
  {
    title: "Web Scraper",
    description: "Scrape products from websites",
    icon: <Bot className="h-8 w-8" />,
    href: "/scraper",
  },
  {
    title: "Brand Logo Uploader",
    description: "Upload logos to brands & categories",
    icon: <UploadIcon className="h-8 w-8" />,
    href: "/brand-logo-uploader",
  },
  {
    title: "Web Performance",
    description: "Analyze website performance",
    icon: <BarChart className="h-8 w-8" />,
    href: "/web-performance",
  },
  {
    title: "Bulk Product SEO",
    description: "Generate SEO content with AI",
    icon: <FileText className="h-8 w-8" />,
    href: "/bulk-product-seo",
  },
  {
    title: "Prompt Maker",
    description: "Create AI prompts for products",
    icon: <MessageSquareText className="h-8 w-8" />,
    href: "/prompts",
  },
  {
    title: "Settings",
    description: "Configure application settings",
    icon: <ListFilter className="h-8 w-8" />,
    href: "/settings",
  },
];

const QuickLinks = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {links.map((link) => (
        <Link
          key={link.title}
          to={link.href}
          className="group relative rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-center space-x-4">
              <div className="grid place-items-center rounded-md bg-slate-900 p-2 text-white dark:bg-slate-700">
                {link.icon}
              </div>
              <div>
                <h3 className="font-semibold">{link.title}</h3>
                <p className="text-sm text-muted-foreground">{link.description}</p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default QuickLinks;
