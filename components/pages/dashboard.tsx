"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import {
  DollarSign,
  CalendarCheck,
  Users,
  Footprints,
  Globe,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export function DashboardPage() {

  const [appointments, setAppointments] = useState<any[]>([])
  const [barbers, setBarbers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])

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

    // Map → UI structure
    const mapped = (appts || []).map((a: any) => ({
      id: a.id,
      clientName: a.client_name,
      service: a.services?.name,
      barberName: a.barbers?.name,
      date: a.appointment_date,
      time: a.appointment_time,
      status: a.status,
      paymentStatus: a.payment_status,
      amount: a.services?.price || 0,
      type: a.booking_type || "online",
    }))

    setAppointments(mapped)
    setBarbers(barbersData || [])
    setServices(servicesData || [])
  }

  // 🔹 Same logic — now using DB data

  const today = new Date().toISOString().split("T")[0]

  const todayAppointments = appointments.filter((a) => a.date === today)

  const todayRevenue = todayAppointments
    .filter((a) => a.paymentStatus === "paid")
    .reduce((sum, a) => sum + a.amount, 0)

  const totalBookings = todayAppointments.length

  const activeBarbers = barbers.filter(
    (b) => b.status === "present" || b.status === "half-day"
  ).length

  const walkIns = todayAppointments.filter((a) => a.type === "walk-in").length
  const onlineBookings = todayAppointments.filter((a) => a.type === "online").length

  const barberPerformance = barbers.map((b) => {

    const barberAppts = todayAppointments.filter(
      (a) => a.barberName === b.name
    )

    return {
      name: b.name.split(" ")[0],
      clients: barberAppts.length,
      revenue: barberAppts.reduce((s, a) => s + a.amount, 0),
    }
  })

  // Weekly revenue (simple grouping)
  const weeklyRevenue = todayAppointments.map((a) => ({
    day: new Date(a.date).toLocaleDateString("en-IN", { weekday: "short" }),
    revenue: a.amount,
  }))

  // Service revenue
  const serviceMap: any = {}

  todayAppointments.forEach((a) => {
    if (!serviceMap[a.service]) serviceMap[a.service] = 0
    serviceMap[a.service] += a.amount
  })

  const serviceRevenue = Object.keys(serviceMap).map((name) => ({
    name,
    revenue: serviceMap[name],
  }))

  const kpiCards = [
    { title: "Today's Revenue", value: `₹${todayRevenue.toLocaleString()}`, icon: DollarSign },
    { title: "Total Bookings", value: totalBookings, icon: CalendarCheck },
    { title: "Active Barbers", value: `${activeBarbers}/${barbers.length}`, icon: Users },
    { title: "Walk-in Clients", value: walkIns, icon: Footprints },
    { title: "Online Bookings", value: onlineBookings, icon: Globe },
  ]

  const COLORS = [
    "hsl(25, 55%, 45%)",
    "hsl(35, 60%, 55%)",
    "hsl(15, 40%, 35%)",
    "hsl(40, 50%, 60%)",
    "hsl(20, 70%, 50%)",
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back! Here is your salon overview for today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title}>
              <CardContent className="p-5 flex justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <Icon className="h-5 w-5" />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        <Card>
          <CardHeader>
            <CardTitle>Weekly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={weeklyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line dataKey="revenue" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Barber Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barberPerformance}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clients" />
                <Bar dataKey="revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <Card>
          <CardHeader>
            <CardTitle>Service Revenue Split</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={serviceRevenue} dataKey="revenue">
                  {serviceRevenue.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.slice(0, 6).map((apt) => (
              <div key={apt.id} className="flex justify-between py-2">
                <span>{apt.clientName}</span>
                <span>{apt.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
