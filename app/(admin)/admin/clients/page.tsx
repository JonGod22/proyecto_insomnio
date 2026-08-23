import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function ClientsAdminPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name, phone, email, last_visit_at, appointments(count)")
    .order("full_name");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Clientes</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Turnos</TableHead>
            <TableHead>Última visita</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients?.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.full_name}</TableCell>
              <TableCell>{client.phone}</TableCell>
              <TableCell>{client.email ?? "—"}</TableCell>
              <TableCell>
                {(client.appointments as unknown as { count: number }[])?.[0]?.count ?? 0}
              </TableCell>
              <TableCell>
                {client.last_visit_at
                  ? new Date(client.last_visit_at).toLocaleDateString("es-AR")
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
          {(!clients || clients.length === 0) && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Todavía no hay clientes.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
