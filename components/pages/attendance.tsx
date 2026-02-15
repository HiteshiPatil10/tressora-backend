"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

import {
  ClipboardCheck,
  Clock,
  Users,
  DollarSign,
} from "lucide-react"

export function AttendancePage() {

  const [attendanceList, setAttendanceList] = useState<any[]>([])

  useEffect(() => {
    fetchAttendance()
  }, [])

  async function fetchAttendance() {

    const today = new Date().toISOString().split("T")[0]

    const { data } = await supabase
      .from("attendance")
      .select(`
        id,
        status,
        login_time,
        logout_time,
        total_hours,
        barbers (
          id,
          name,
          role,
          avatar,
          clients_handled,
          revenue_generated
        )
      `)
      .eq("date", today)

    const mapped = (data || []).map((a: any) => ({
      id: a.barbers.id,
      name: a.barbers.name,
      role: a.barbers.role,
      avatar: a.barbers.avatar,
      status: a.status,
      loginTime: a.login_time,
      logoutTime: a.logout_time,
      totalHours: a.total_hours,
      clientsHandled: a.barbers.clients_handled,
      revenueGenerated: a.barbers.revenue_generated,
    }))

    setAttendanceList(mapped)
  }

  async function togglePresent(id: string) {

    const staff = attendanceList.find((s) => s.id === id)
    if (!staff) return

    const newStatus =
      staff.status === "present" ? "absent" : "present"

    await supabase
      .from("attendance")
      .update({ status: newStatus })
      .eq("barber_id", id)

    fetchAttendance()
  }

  const presentCount = attendanceList.filter(
    (b) => b.status === "present" || b.status === "half-day"
  ).length

  const totalHours = attendanceList.reduce(
    (s, b) => s + (b.totalHours || 0),
    0
  )

  const totalClients = attendanceList.reduce(
    (s, b) => s + b.clientsHandled,
    0
  )

  const totalRevenue = attendanceList.reduce(
    (s, b) => s + b.revenueGenerated,
    0
  )

  const summaryCards = [
    {
      title: "Present Today",
      value: `${presentCount}/${attendanceList.length}`,
      icon: Users,
      color: "text-emerald-600",
    },
    {
      title: "Total Hours",
      value: `${totalHours}h`,
      icon: Clock,
      color: "text-blue-600",
    },
    {
      title: "Clients Handled",
      value: totalClients,
      icon: ClipboardCheck,
      color: "text-amber-600",
    },
    {
      title: "Revenue Generated",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-primary",
    },
  ]

  const statusColor: Record<string, string> = {
    present: "bg-emerald-100 text-emerald-700",
    absent: "bg-red-100 text-red-700",
    "half-day": "bg-amber-100 text-amber-700",
    "on-leave": "bg-muted text-muted-foreground",
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold">
          Attendance & Availability
        </h1>
        <p className="text-sm text-muted-foreground">
          Track daily attendance and barber availability
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardContent className="flex items-center gap-3 p-4">
                <Icon className={`h-5 w-5 ${card.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-xl font-bold">
                    {card.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            Today's Attendance
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[700px]">

            <tbody>
              {attendanceList.map((staff) => (
                <tr key={staff.id} className="border-b">

                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {staff.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {staff.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {staff.role}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="text-center">
                    <Switch
                      checked={
                        staff.status === "present" ||
                        staff.status === "half-day"
                      }
                      onCheckedChange={() =>
                        togglePresent(staff.id)
                      }
                    />
                  </td>

                  <td>{staff.loginTime || "-"}</td>
                  <td>{staff.logoutTime || "-"}</td>
                  <td>{staff.totalHours || 0}h</td>
                  <td>{staff.clientsHandled}</td>
                  <td>₹{staff.revenueGenerated}</td>

                  <td>
                    <Badge
                      className={`${statusColor[staff.status]} text-xs`}
                    >
                      {staff.status}
                    </Badge>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </CardContent>
      </Card>

    </div>
  )
}
