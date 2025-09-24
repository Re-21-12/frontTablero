export interface NavigationItem {
  label: string;
  route: string;
  requiredPermissions?: string[];
  icon?: string;
  children?: NavigationItem[];
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
  icon?: string;
}
