// Opcional del TP: pagina de admin para cambiar roles con authClient.admin.setRole.
import { useCallback, useEffect, useState } from "react";
import { authClient, useSession, type UserRole } from "../../lib/auth-client";

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  createdAt: Date | string;
}

export const AdminUsers = () => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await authClient.admin.listUsers({
      query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
    });
    if (error) setError(error.message ?? "No se pudieron cargar los usuarios");
    else setUsers(data.users as AdminUserRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const changeRole = async (userId: string, role: UserRole) => {
    setSavingId(userId);
    setError(null);
    const { error } = await authClient.admin.setRole({ userId, role });
    if (error) setError(error.message ?? "No se pudo cambiar el rol");
    await load();
    setSavingId(null);
  };

  return (
    <section>
      <h1 className="text-2xl font-bold">Usuarios</h1>
      <p className="mb-6 text-sm text-slate-600">Cambiá el rol de cada usuario (user / admin).</p>

      {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="text-slate-500">Cargando usuarios...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Alta</th>
                <th className="px-4 py-3">Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const isMe = user.id === session?.user.id;
                return (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium">
                      {user.name} {isMe && <span className="text-xs text-slate-400">(vos)</span>}
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString("es-AR")}</td>
                    <td className="px-4 py-3">
                      <select
                        className="input w-auto py-1"
                        value={user.role === "admin" ? "admin" : "user"}
                        disabled={isMe || savingId === user.id}
                        title={isMe ? "No podés cambiar tu propio rol" : undefined}
                        onChange={(event) => changeRole(user.id, event.target.value as UserRole)}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
