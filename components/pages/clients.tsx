"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Search, UserCircle } from "lucide-react"

export function ClientsPage() {

  const [clients, setClients] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [selectedClient, setSelectedClient] = useState<any>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {

    const { data: clientsData } = await supabase
      .from("clients")
      .select("*")

    const { data: appts } = await supabase
      .from("appointments")
      .select(`
        *,
        services(name, price),
        barbers(name)
      `)

    const mapped = (clientsData || []).map((c: any) => {

      const visits = (appts || []).filter(
        (a: any) => a.client_name === c.name
      )

      const totalSpend = visits.reduce(
        (s: number, v: any) => s + (v.services?.price || 0),
        0
      )

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        totalVisits: visits.length,
        totalSpend,
        lastVisit: visits[0]?.appointment_date || "—",
        favoriteBarber: c.favorite_barber || "—",
        preferredServices: [
          ...new Set(visits.map((v: any) => v.services?.name)),
        ],
        visits: visits.map((v: any) => ({
          service: v.services?.name,
          barber: v.barbers?.name,
          date: v.appointment_date,
          amount: v.services?.price,
        })),
      }
    })

    setClients(mapped)
  }

  const filtered = clients.filter((c) => {
    if (
      search &&
      !c.name.toLowerCase().includes(search.toLowerCase()) &&
      !c.phone.includes(search)
    )
      return false
    return true
  })

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold">
          Clients CRM
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage client relationships
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="flex items-center gap-3 p-4">

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Badge>{filtered.length} clients</Badge>

        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            Client Directory
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <tbody>

              {filtered.map((client) => (
                <tr key={client.id} className="border-b">

                  <td className="px-3 py-3">
                    <div className="flex gap-2">

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {client.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </div>

                      <div>
                        <p className="text-sm font-medium">
                          {client.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {client.email}
                        </p>
                      </div>

                    </div>
                  </td>

                  <td>{client.phone}</td>

                  <td>
                    <Badge>{client.totalVisits}</Badge>
                  </td>

                  <td>₹{client.totalSpend}</td>

                  <td>{client.lastVisit}</td>

                  <td>{client.favoriteBarber}</td>

                  <td className="text-right">
                    <Button
                      size="sm"
                      onClick={() => setSelectedClient(client)}
                    >
                      View Profile
                    </Button>
                  </td>

                </tr>
              ))}

            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Profile Drawer */}
      <Dialog
        open={!!selectedClient}
        onOpenChange={() => setSelectedClient(null)}
      >
        <DialogContent className="sm:max-w-lg">

          <DialogHeader>
            <DialogTitle>
              Client Profile
            </DialogTitle>
          </DialogHeader>

          {selectedClient && (
            <div className="flex flex-col gap-4">

              <div>
                <h3 className="text-lg font-semibold">
                  {selectedClient.name}
                </h3>
                <p>{selectedClient.phone}</p>
                <p>{selectedClient.email}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">

                <div className="text-center">
                  <p className="font-bold">
                    {selectedClient.totalVisits}
                  </p>
                  <p className="text-xs">Visits</p>
                </div>

                <div className="text-center">
                  <p className="font-bold">
                    ₹{selectedClient.totalSpend}
                  </p>
                  <p className="text-xs">Spend</p>
                </div>

                <div className="text-center">
                  <p className="font-bold">
                    {selectedClient.favoriteBarber}
                  </p>
                  <p className="text-xs">Fav Barber</p>
                </div>

              </div>

              {/* Visits */}
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  Recent Visits
                </h4>

                {selectedClient.visits.map((v: any, i: number) => (
                  <div key={i} className="flex justify-between border p-2 rounded">

                    <div>
                      <p>{v.service}</p>
                      <p className="text-xs text-muted-foreground">
                        with {v.barber} on {v.date}
                      </p>
                    </div>

                    <span>₹{v.amount}</span>

                  </div>
                ))}

              </div>

            </div>
          )}

        </DialogContent>
      </Dialog>

    </div>
  )
}
