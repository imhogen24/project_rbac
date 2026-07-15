type Role = "admin" | "engineer";
type RoleBannerProps = {
  role: Role;
};
function badgeStyles(role: Role) {
  const styles = {
    admin: "bg-primary text-primary-foreground",
    engineer: "bg-muted text-muted-foreground",
  } as const;
  return styles[role];
}
function badgeLabel(role: Role) {
  return role === "admin" ? "Admin" : "Engineer";
}
function roleMessage(role: Role) {
  return role === "admin"
    ? "You have full system access."
    : "You have access to your workspace.";
}
export default function RoleBanner({ role }: RoleBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3">
      <span
        className={
          `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyles(role)}`
        }
      >
        {badgeLabel(role)}
      </span>
      <p className="text-sm text-foreground">{roleMessage(role)}</p>
    </div>
  );
}
