
import DashboardStats from "@/components/Dashboard/DashboardStats";
import QuickLinks from "@/components/Dashboard/QuickLinks";
import AboutBox from "@/components/Dashboard/AboutBox";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Waleed Smart WooCommerce</p>
      </div>
      
      <DashboardStats />
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <QuickLinks />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <AboutBox />
        <Card>
          <CardHeader>
            <CardTitle>License Information</CardTitle>
            <CardDescription>Your license details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">License Type</h3>
                <p className="text-sm text-muted-foreground">Full (Lifetime)</p>
              </div>
              <div>
                <h3 className="font-medium">Status</h3>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                  <span className="text-sm text-muted-foreground">Active</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium">Device ID</h3>
                <p className="text-sm text-muted-foreground truncate">WL-MAC-12345-CPU-67890-HOST-PC1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
