"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Clock,
  Users,
} from "lucide-react"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = [
  "hsl(25, 55%, 45%)",
  "hsl(35, 60%, 55%)",
  "hsl(15, 40%, 35%)",
  "hsl(40, 50%, 60%)",
  "hsl(20, 70%, 50%)",
]

export function AnalyticsPage() {

  const [period, setPeriod] = useState("weekly")
  const [barberFilter, setBarberFilter] = useState("all")

  const [appointments, setAppointments] = useState<any[]>([])
  const [barbers, setBarbers] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {

    const { data: appts } = await supabase
      .from("appointments")
      .select("*")

    const { data: barbersData } = await supabase
      .from("barbers")
      .select("*")

    setAppointments(appts || [])
    setBarbers(barbersData || [])
  }

  /* ---------------- Revenue Aggregation ---------------- */

  function groupRevenue() {

    const map: Record<string, { revenue: number; bookings: number }> = {}

    appointments.forEach((a) => {

      const date = new Date(a.date)

      let key = ""

      if (period === "weekly") {
        key = date.toLocaleDateString("en-IN", { weekday: "short" })
      }
      else if (period === "monthly") {
        key = date.toLocaleDateString("en-IN", { month: "short" })
      }
      else {
        key = date.getFullYear().toString()
      }

      if (!map[key]) {
        map[key] = { revenue: 0, bookings: 0 }
      }

      map[key].revenue += a.amount || 0
      map[key].bookings += 1
    })

    return Object.entries(map).map(([k, v]) => ({
      label: k,
      ...v,
    }))
  }

  const revenueData = groupRevenue()

  /* ---------------- Service Revenue ---------------- */

  const serviceMap: Record<string, number> = {}

  appointments.forEach((a) => {
    const s = a.service_name || "Other"
    if (!serviceMap[s]) serviceMap[s] = 0
    serviceMap[s] += a.amount || 0
  })

  const serviceRevenue = Object.entries(serviceMap).map(
    ([name, revenue]) => ({ name, revenue })
  )

  /* ---------------- Peak Hours ---------------- */

  const hourMap: Record<string, number> = {}

  appointments.forEach((a) => {
    if (!a.time) return
    const hour = a.time.slice(0, 2) + ":00"
    if (!hourMap[hour]) hourMap[hour] = 0
    hourMap[hour]++
  })

  const peakHours = Object.entries(hourMap).map(
    ([hour, bookings]) => ({ hour, bookings })
  )

  /* ---------------- Barber Stats ---------------- */

  const barberStats = barbers.map((b) => {

    const barberAppts = appointments.filter(
      (a) => a.barber_id === b.id
    )

    const revenue = barberAppts.reduce(
      (s, a) => s + (a.amount || 0),
      0
    )

    return {
      id: b.id,
      fullName: b.name,
      totalClients: barberAppts.length,
      revenue,
    }
  })

  const filteredBarberStats =
    barberFilter === "all"
      ? barberStats
      : barberStats.filter((b) => b.id === barberFilter)

  /* ---------------- KPIs ---------------- */

  const totalRevenue = appointments.reduce(
    (s, a) => s + (a.amount || 0),
    0
  )

  const totalBookings = appointments.length

  /* ---------------- UI ---------------- */

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Revenue & Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Deep insights into your salon performance
          </p>
        </div>

        <Select
          value={barberFilter}
          onValueChange={setBarberFilter}
        >
          <SelectTrigger className="w-[160px]">
            <Users className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter barber" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {barbers.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <Card>
          <CardContent className="p-4 flex gap-3 items-center">
            <DollarSign />
            <div>
              <p className="text-xs">Revenue</p>
              <p className="font-bold">
                ₹{totalRevenue.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex gap-3 items-center">
            <BarChart3 />
            <div>
              <p className="text-xs">Bookings</p>
              <p className="font-bold">
                {totalBookings}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex gap-3 items-center">
            <TrendingUp />
            <div>
              <p className="text-xs">Avg / Booking</p>
              <p className="font-bold">
                ₹{totalBookings ? Math.round(totalRevenue / totalBookings) : 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex gap-3 items-center">
            <Clock />
            <div>
              <p className="text-xs">Peak Slots</p>
              <p className="font-bold">
                {peakHours.sort((a,b)=>b.bookings-a.bookings)[0]?.hour || "-"}
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Area dataKey="revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* Bottom */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={peakHours} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="hour" type="category" />
                <Tooltip />
                <Bar dataKey="bookings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Top Services</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={serviceRevenue} dataKey="revenue">
                  {serviceRevenue.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Barber Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Barber Performance</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            {filteredBarberStats.map((b) => (
              <div
                key={b.id}
                className="flex justify-between border rounded-lg px-3 py-2"
              >
                <span>{b.fullName}</span>
                <span className="font-bold">
                  ₹{b.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

    </div>
  )
}
