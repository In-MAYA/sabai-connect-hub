import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";

const HIDE_NAV = ["/auth", "/otp", "/setup-profile", "/call", "/chat/", "/product/"];

export function AppLayout() {
  const { pathname } = useLocation();
  const hideNav = HIDE_NAV.some((p) => pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-gradient-sky">
      <div className="phone-frame bg-background pb-24">
        <Outlet />
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
