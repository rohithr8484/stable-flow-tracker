import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { toast } from "sonner";

interface MezoPassportButtonProps {
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function MezoPassportButton({
  size = "default",
  className = "",
}: MezoPassportButtonProps) {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // Dynamic import to avoid SSR/bundle issues
      const passport = await import("@mezo-org/passport");
      const mezoPassport = passport.default || passport;

      if (typeof mezoPassport.connect === "function") {
        await mezoPassport.connect();
        toast.success("Connected via Mezo Passport");
      } else if (typeof mezoPassport.init === "function") {
        await mezoPassport.init();
        toast.success("Mezo Passport initialized");
      } else {
        // Fallback: open Mezo passport page
        window.open("https://passport.mezo.org", "_blank", "noopener");
        toast.info("Opening Mezo Passport…");
      }
    } catch (err: any) {
      console.error("Mezo Passport error:", err);
      toast.error(err?.message || "Failed to connect Mezo Passport");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <Button
      type="button"
      size={size}
      variant="secondary"
      className={`gap-2 ${className}`.trim()}
      onClick={handleConnect}
      disabled={connecting}
    >
      <Shield className="h-4 w-4" />
      {connecting ? "Connecting…" : "Connect via Mezo Passport"}
    </Button>
  );
}
