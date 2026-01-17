export type AppRole = "admin" | "staff" | "viewer";

export const DEFAULT_ROLE: AppRole = "admin";

export const mergeRoles = (
  ...roleLists: (AppRole[] | undefined | null)[]
): AppRole[] => {
  const allRoles = roleLists
    .flatMap((roles) => roles ?? [])
    .filter((role): role is AppRole => Boolean(role));

  return Array.from(new Set(allRoles));
};

export const hasRequiredRole = (
  userRoles: AppRole[] | undefined | null,
  required: AppRole[] | AppRole
): boolean => {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  const requiredRoles = Array.isArray(required) ? required : [required];

  return requiredRoles.some((role) => userRoles.includes(role));
};


