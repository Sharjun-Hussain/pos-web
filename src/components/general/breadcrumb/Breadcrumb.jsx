"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  const [breadcrumbItems, setBreadcrumbItems] = useState([]);

  // Format segment names to be more readable
  const formatSegmentName = (segment) => {
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    // Don't render breadcrumb if we're only on home or app page
    if (pathname === "/" || pathname === "/app") {
      setBreadcrumbItems([]);
      return;
    }

    const pathSegments = pathname
      .split("/")
      .filter((segment) => segment !== "" && segment !== "app");

    if (pathSegments.length === 0) {
      setBreadcrumbItems([]);
      return;
    }

    const items = [];

    // Add Home breadcrumb
    items.push(
      <BreadcrumbItem key="home">
        <BreadcrumbLink asChild>
          <Link href="/">Home</Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
    );

    // Add separator if there are additional segments
    if (pathSegments.length > 0) {
      items.push(<BreadcrumbSeparator key="sep-home" />);
    }

    // Generate breadcrumb items
    pathSegments.forEach((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      const isLast = index === pathSegments.length - 1;
      const formattedName = formatSegmentName(segment);

      // Add the breadcrumb item
      items.push(
        <BreadcrumbItem key={href}>
          {!isLast ? (
            <BreadcrumbLink asChild>
              <Link href={href}>{formattedName}</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{formattedName}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
      );

      // Add separator if not the last item
      if (!isLast) {
        items.push(<BreadcrumbSeparator key={`sep-${href}`} />);
      }
    });

    setBreadcrumbItems(items);
  }, [pathname]);

  // Don't render anything if no breadcrumb items
  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>{breadcrumbItems}</BreadcrumbList>
    </Breadcrumb>
  );
}
