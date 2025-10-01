import { Home, Users, Activity, FileText, Scan, Camera, TrendingUp, Smartphone } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home, status: "available" },
  { title: "Pacientes", url: "/patients", icon: Users, status: "available" },
  { title: "Digitalização", url: "/documents", icon: Scan, status: "available" },
  { title: "Atividades", url: "/activities", icon: Activity, status: "available" },
];

const comingSoonItems = [
  { title: "Dispositivos IoT", url: "/devices", icon: Camera, status: "coming-soon" },
  { title: "Analytics", url: "/analytics", icon: TrendingUp, status: "coming-soon" },
  { title: "App Mobile", url: "/mobile", icon: Smartphone, status: "coming-soon" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/");

  const renderMenuItem = (item: any) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild isActive={isActive(item.url)}>
        <NavLink to={item.url} className="flex items-center gap-3 relative">
          <item.icon className="h-5 w-5" />
          {!collapsed && (
            <div className="flex items-center justify-between w-full">
              <span>{item.title}</span>
              {item.status === "coming-soon" && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                  Em breve
                </Badge>
              )}
            </div>
          )}
          {collapsed && item.status === "coming-soon" && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Funcionalidades Principais
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            {collapsed ? "⚡" : "⚡ Próximas Funcionalidades"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {comingSoonItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
