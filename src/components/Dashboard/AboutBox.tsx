
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";

const AboutBox = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
        <CardDescription>Application information and developer contact</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Application</h3>
            <p className="text-sm text-muted-foreground">Waleed Smart WooCommerce</p>
          </div>
          
          <div>
            <h3 className="font-medium">Developer</h3>
            <p className="text-sm text-muted-foreground">Waleed Mohamed</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a 
              href="mailto:dr.vet.waleedtam@gmail.com" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              dr.vet.waleedtam@gmail.com
            </a>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a 
              href="tel:+96555683677" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              +96555683677
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AboutBox;
