type Role = "admin" | "engineer";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type AdminUserTableProps = {
  users: User[];
};

function roleBadgeClass(role: Role) {
  return role === "admin"
    ? "bg-primary text-primary-foreground"
    : "bg-muted text-muted-foreground";
}

export function AdminUserTable({ users }: AdminUserTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Name
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Email
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Role
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3 text-foreground">{user.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeClass(user.role)}`}
                >
                  {user.role === "admin" ? "Admin" : "Engineer"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
