"use client";

import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";

export function usePermission() {
    const { data: session } = useSession();

    const userPermissions = useMemo(() => {
        if (!session?.user?.roles) return new Set();

        const permissions = new Set();
        session.user.roles.forEach((role) => {
            role.permissions?.forEach((permission) => {
                permissions.add(permission.name);
            });
        });
        return permissions;
    }, [session]);

    const userRoles = useMemo(() => {
        if (!session?.user?.roles) return new Set();
        return new Set(session.user.roles.map((r) => r.name));
    }, [session]);

    const hasPermission = useCallback(
        (permissionName) => {
            // Super Admin bypass (optional, but common)
            if (userRoles.has("Super Admin")) return true;
            return userPermissions.has(permissionName);
        },
        [userPermissions, userRoles]
    );

    const hasRole = useCallback(
        (roleName) => {
            return userRoles.has(roleName);
        },
        [userRoles]
    );

    return { hasPermission, hasRole, isLoaded: !!session };
}
