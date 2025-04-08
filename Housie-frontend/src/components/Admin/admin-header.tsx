import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";

export default function AdminHeader() {
  return (
    <div className="flex h-16 w-full items-center border-b bg-background px-4 py-2 justify-between">
      <div className="text-lg font-bold">Admin Panel</div> {/* Admin Panel on the left */}
      <div className="flex items-center gap-8"> {/* Navigation menu in the center */}
        <NavigationMenu>
          <NavigationMenuList className="flex gap-4"> {/* Added gap between menu items */}
            <NavigationMenuItem>
              <NavigationMenuLink href="/managevideos" className="text-sm font-medium">
                Manage Videos
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/manageuser" className="text-sm font-medium">
                Manage User
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/bingoticket" className="text-sm font-medium">
                Bingo Ticket
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <button className="text-sm text-muted-foreground">Logout</button> {/* Logout on the far right */}
    </div>
  );
}