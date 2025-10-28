import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

export function SystemBreadcrumb() {
  const pathname = usePathname();

  // Generate breadcrumb items from the pathname, filtering out "app"
  const generateBreadcrumbItems = () => {
    if (pathname === "/") return null;

    const pathSegments = pathname
      .split("/")
      .filter((segment) => segment !== "" && segment !== "app");

    if (pathSegments.length === 0) return null;

    return pathSegments.map((segment, index) => {
      // Reconstruct href while filtering out "app" from the path
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      const isLast = index === pathSegments.length - 1;
      const formattedName = formatSegmentName(segment);

      return (
        <BreadcrumbItem key={href}>
          {!isLast ? (
            <>
              <BreadcrumbLink asChild>
                <Link href={href}>{formattedName}</Link>
              </BreadcrumbLink>
              <BreadcrumbSeparator />
            </>
          ) : (
            <BreadcrumbPage>{formattedName}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
      );
    });
  };

  // Format segment names to be more readable
  const formatSegmentName = (segment) => {
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Don't render breadcrumb if we're only on home or app page
  if (pathname === "/" || pathname === "/app") {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
          {pathname !== "/" && <BreadcrumbSeparator />}
        </BreadcrumbItem>
        {generateBreadcrumbItems()}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
