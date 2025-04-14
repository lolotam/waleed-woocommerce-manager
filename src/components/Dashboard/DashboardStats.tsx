
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Tag, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productsApi, categoriesApi, brandsApi, extractData } from "@/utils/api";
import { toast } from "sonner";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  isLoading: boolean;
}

const StatsCard = ({ title, value, icon: Icon, isLoading }: StatsCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="h-8 w-16 bg-muted animate-pulse rounded" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);

const DashboardStats = () => {
  // Fetch products count
  const { 
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError
  } = useQuery({
    queryKey: ['products-count'],
    queryFn: async () => {
      try {
        // Just fetch with smallest per_page possible to get the header with total count
        const response = await productsApi.getAll({ per_page: "1" });
        return response.totalItems || 0;
      } catch (error) {
        console.error('Error fetching products count:', error);
        return 0;
      }
    }
  });

  // Fetch categories count
  const { 
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError
  } = useQuery({
    queryKey: ['categories-count'],
    queryFn: async () => {
      try {
        const response = await categoriesApi.getAll({ per_page: "1" });
        return response.totalItems || 0;
      } catch (error) {
        console.error('Error fetching categories count:', error);
        return 0;
      }
    }
  });

  // Fetch brands count (using product tags)
  const { 
    data: brandsData,
    isLoading: isLoadingBrands,
    error: brandsError
  } = useQuery({
    queryKey: ['brands-count'],
    queryFn: async () => {
      try {
        const response = await brandsApi.getAll({ per_page: "1" });
        return response.totalItems || 0;
      } catch (error) {
        console.error('Error fetching brands count:', error);
        return 0;
      }
    }
  });

  // Show toast for any errors
  useEffect(() => {
    if (productsError || categoriesError || brandsError) {
      toast.error("Failed to fetch some dashboard statistics", {
        description: "Check your WooCommerce connection in settings."
      });
    }
  }, [productsError, categoriesError, brandsError]);

  const stats = [
    { 
      title: 'Total Products', 
      value: productsData || 0, 
      icon: Package,
      isLoading: isLoadingProducts
    },
    { 
      title: 'Total Categories', 
      value: categoriesData || 0, 
      icon: Tag,
      isLoading: isLoadingCategories
    },
    { 
      title: 'Total Brands', 
      value: brandsData || 0, 
      icon: ShoppingBag,
      isLoading: isLoadingBrands
    },
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
