
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { Package, Tag, ShoppingBag, MessageSquare, FileSpreadsheet, FolderTree } from "lucide-react";

const QuickLinks = () => {
  const links = [
    { title: 'Manage Products', icon: Package, path: '/products', description: 'Add, edit, or remove products from your store' },
    { title: 'Manage Categories', icon: FolderTree, path: '/categories', description: 'Organize your product categories' },
    { title: 'Manage Brands', icon: ShoppingBag, path: '/brands', description: 'Create and organize product brands' },
    { title: 'AI Prompts', icon: MessageSquare, path: '/prompts', description: 'Configure AI prompts for content generation' },
    { title: 'Import/Export', icon: FileSpreadsheet, path: '/import-export', description: 'Bulk manage your products with Excel' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {links.map((link, index) => (
        <Link key={index} to={link.path} className="block">
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <link.icon className="h-5 w-5 text-muted-foreground mb-1" />
              <CardTitle className="text-lg">{link.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{link.description}</CardDescription>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default QuickLinks;
