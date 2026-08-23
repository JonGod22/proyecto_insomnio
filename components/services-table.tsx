"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ServiceDialog } from "@/components/service-dialog";
import { deleteService } from "@/app/(admin)/admin/services/actions";
import type { Service } from "@/lib/types";

function formatMoney(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(
    value
  );
}

export function ServicesTable({ services }: { services: Service[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ServiceDialog trigger={<Button>Nuevo servicio</Button>} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Seña</TableHead>
            <TableHead>Duración</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell>{service.price_on_request ? "A consultar" : formatMoney(service.price)}</TableCell>
              <TableCell>{formatMoney(service.deposit_amount)}</TableCell>
              <TableCell>
                {service.duration_minutes}
                {service.duration_minutes_max ? `-${service.duration_minutes_max}` : ""} min
              </TableCell>
              <TableCell>
                <Badge variant={service.active ? "default" : "secondary"}>
                  {service.active ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <ServiceDialog service={service} trigger={<Button variant="outline" size="sm">Editar</Button>} />
                <form action={deleteService.bind(null, service.id)}>
                  <Button variant="destructive" size="sm" type="submit">
                    Eliminar
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
          {services.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Todavía no hay servicios cargados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
