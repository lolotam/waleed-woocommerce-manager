
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Tag, ShoppingBag } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
}

const StatsCard = ({ title, value, icon: Icon }: StatsCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const DashboardStats = () => {
  // In a real app, these would come from API calls
  const stats = [
    { title: 'Total Products', value: 126, icon: Package },
    { title: 'Total Categories', value: 18, icon: Tag },
    { title: 'Total Brands', value: 32, icon: ShoppingBag },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;
