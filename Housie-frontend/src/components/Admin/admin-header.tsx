import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { NavLink, useNavigate } from "react-router-dom";

export default function AdminHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here
    navigate("/login"); // Redirect to the login page after logout
  };

  return (
    <div className="flex h-16 w-full items-center border-b bg-background px-4 py-2 justify-between">
      <div className="text-lg font-bold">Admin Panel</div> {/* Admin Panel on the left */}
      <div className="flex items-center gap-8"> {/* Navigation menu in the center */}
        <NavigationMenu>
          <NavigationMenuList className="flex gap-4"> {/* Added gap between menu items */}
            <NavigationMenuItem>
              <NavLink
                to="/managevideos"
                className={({ isActive }: { isActive: boolean }) =>
                  `text-sm font-medium ${isActive ? "text-primary" : ""}`
                }
              >
                Manage Videos
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink
                to="/manageuser"
                className={({ isActive }: { isActive: boolean }) =>
                  `text-sm font-medium ${isActive ? "text-primary" : ""}`
                }
              >
                Manage User
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink
                to="/bingoticket"
                className={({ isActive }: { isActive: boolean }) =>
                  `text-sm font-medium ${isActive ? "text-primary" : ""}`
                }
              >
                Manage Session
              </NavLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm text-muted-foreground"
      >
        Logout
      </button> {/* Logout on the far right */}
    </div>
  );
}