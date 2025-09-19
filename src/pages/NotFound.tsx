import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelCard, PixelCardContent } from "@/components/ui/pixel-card";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <PixelCard className="text-center max-w-md">
        <PixelCardContent className="space-y-6">
          <div className="w-24 h-24 mx-auto border-4 border-foreground bg-muted flex items-center justify-center">
            <span className="font-pixel-xl text-4xl">404</span>
          </div>
          
          <div>
            <h1 className="font-pixel-xl text-2xl mb-2">Page Not Found</h1>
            <p className="font-pixel text-muted-foreground">
              This page got rugged. Let's get you back to safety.
            </p>
          </div>
          
          <div className="flex gap-3">
            <PixelButton 
              onClick={() => window.history.back()}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </PixelButton>
            <PixelButton 
              onClick={() => window.location.href = "/"}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </PixelButton>
          </div>
        </PixelCardContent>
      </PixelCard>
    </div>
  );
};

export default NotFound;
