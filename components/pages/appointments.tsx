"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Search, Filter, Plus, CalendarDays } from "lucide-react"

export function AppointmentsPage() {

  // 🔹 Supabase state
  const [appointments, setAppointments] = useState<any[]>([])
  const [barbers, setBarbers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])

  // 🔹 Existing states (unchanged)
  const [search, setSearch] = useState("")
  const [filterBarber, setFilterBarber] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterService, setFilterService] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)

  const [newAppt, setNewAppt] = useState({
    clientName: "",
    clientPhone: "",
    service: "",
    barberId: "",
    date: "",
    time: "",
  })

  // 🔹 Fetch Supabase data
  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: appts } = await supabase
      .from("appointments")
      .select(`
        *,
        services(name, price),
        barbers(name)
      `)

    const { data: barbersData } = await supabase
      .from("barbers")
      .select("*")

    const { data: servicesData } = await supabase
      .from("services")
      .select("*")

    // Map DB → UI structure
    const mapped = (appts || []).map((a: any) => ({
      id: a.id,
      clientName: a.client_name,
      clientPhone: a.client_phone,
      service: a.services?.name,
      barberId: a.barber_id,
      barberName: a.barbers?.name,
      date: a.appointment_date,
      time: a.appointment_time,
      status: a.status,
      paymentStatus: a.payment_status || "pending",
      amount: a.services?.price || 0,
    }))

    setAppointments(mapped)
    setBarbers(barbersData || [])
    setServices(servicesData || [])
  }

  // 🔹 Original filters (unchanged)
  const filtered = appointments.filter((a) => {
    if (search && !a.clientName.toLowerCase().includes(search.toLowerCase())) return false
    if (filterBarber !== "all" && a.barberId !== filterBarber) return false
    if (filterStatus !== "all" && a.status !== filterStatus) return false
    if (filterService !== "all" && a.service !== filterService) return false
    return true
  })

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: "bg-emerald-100 text-emerald-700",
      upcoming: "bg-blue-100 text-blue-700",
      "in-progress": "bg-amber-100 text-amber-700",
      cancelled: "bg-red-100 text-red-700",
    }
    return map[status] || ""
  }

  const paymentBadge = (status: string) => {
    const map: Record<string, string> = {
      paid: "bg-emerald-100 text-emerald-700",
      pending: "bg-amber-100 text-amber-700",
      partial: "bg-orange-100 text-orange-700",
    }
    return map[status] || ""
  }

  // 🔹 Add appointment (DB insert)
  async function handleAddAppointment() {
    const serviceObj = services.find(s => s.name === newAppt.service)

    await supabase.from("appointments").insert({
      client_name: newAppt.clientName,
      client_phone: newAppt.clientPhone,
      service_id: serviceObj?.id,
      barber_id: newAppt.barberId,
      appointment_date: newAppt.date,
      appointment_time: newAppt.time,
      status: "upcoming",
      payment_status: "pending",
    })

    setShowAddModal(false)
    fetchData()
  }

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER UI SAME */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Appointments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all salon appointments
          </p>
        </div>

        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      {/* FILTERS UI SAME */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by client name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterBarber} onValueChange={setFilterBarber}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Barber" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Barbers</SelectItem>
              {barbers.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        </CardContent>
      </Card>

      {/* TABLE UI SAME */}
      <Card>
        <CardHeader>
          <CardTitle>
            <CalendarDays className="h-4 w-4 inline mr-2" />
            All Appointments
          </CardTitle>
        </CardHeader>

        <CardContent>
          <table className="w-full">
            <tbody>
              {filtered.map((apt) => (
                <tr key={apt.id}>
                  <td>{apt.clientName}</td>
                  <td>{apt.clientPhone}</td>
                  <td>{apt.service}</td>
                  <td>{apt.barberName}</td>
                  <td>{apt.date} {apt.time}</td>
                  <td>
                    <Badge className={statusBadge(apt.status)}>
                      {apt.status}
                    </Badge>
                  </td>
                  <td>
                    <Badge className={paymentBadge(apt.paymentStatus)}>
                      {apt.paymentStatus}
                    </Badge>
                  </td>
                  <td>₹{apt.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
