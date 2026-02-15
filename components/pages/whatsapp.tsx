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

import {
  MessageCircle,
  CheckCheck,
  Check,
  X,
  Eye,
} from "lucide-react"

export function WhatsAppPage() {

  const [logs, setLogs] = useState<any[]>([])
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    const { data } = await supabase
      .from("whatsapp_logs")
      .select("*")
      .order("created_at", { ascending: false })

    setLogs(data || [])
  }

  const filtered = logs.filter((log) => {
    if (filterType !== "all" && log.message_type !== filterType)
      return false
    return true
  })

  const statusIcon: Record<string, React.ReactNode> = {
    delivered: <CheckCheck className="h-4 w-4 text-blue-500" />,
    sent: <Check className="h-4 w-4 text-muted-foreground" />,
    failed: <X className="h-4 w-4 text-destructive" />,
    read: <Eye className="h-4 w-4 text-emerald-500" />,
  }

  const statusColor: Record<string, string> = {
    delivered: "bg-blue-100 text-blue-700",
    sent: "bg-muted text-muted-foreground",
    failed: "bg-red-100 text-red-700",
    read: "bg-emerald-100 text-emerald-700",
  }

  const typeLabels: Record<string, string> = {
    "booking-confirmation": "Booking Confirmation",
    "bill-receipt": "Bill Receipt",
    "thank-you": "Thank You",
    "offer-broadcast": "Offer Broadcast",
  }

  const typeColor: Record<string, string> = {
    "booking-confirmation": "bg-blue-100 text-blue-700",
    "bill-receipt": "bg-amber-100 text-amber-700",
    "thank-you": "bg-emerald-100 text-emerald-700",
    "offer-broadcast": "bg-primary/10 text-primary",
  }

  // Summary stats
  const total = logs.length
  const delivered = logs.filter((l) => l.status === "delivered").length
  const readCount = logs.filter((l) => l.status === "read").length
  const failed = logs.filter((l) => l.status === "failed").length

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          WhatsApp Automation Logs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track all automated WhatsApp notifications
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        {[
          { label: "Total Sent", value: total, color: "text-primary" },
          { label: "Delivered", value: delivered, color: "text-blue-600" },
          { label: "Read", value: readCount, color: "text-emerald-600" },
          { label: "Failed", value: failed, color: "text-destructive" },
        ].map((s) => (

          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">

              <div className="rounded-xl bg-primary/10 p-2.5">
                <MessageCircle className={`h-5 w-5 ${s.color}`} />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  {s.label}
                </p>
                <p className="text-xl font-bold">
                  {s.value}
                </p>
              </div>

            </CardContent>
          </Card>

        ))}
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="flex items-center gap-3 p-4">

          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="booking-confirmation">
                Booking Confirmation
              </SelectItem>
              <SelectItem value="bill-receipt">
                Bill Receipt
              </SelectItem>
              <SelectItem value="thank-you">
                Thank You
              </SelectItem>
              <SelectItem value="offer-broadcast">
                Offer Broadcast
              </SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="outline">
            {filtered.length} messages
          </Badge>

        </CardContent>
      </Card>

      {/* Table */}
      <Card>

        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            Message Logs
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">

          <table className="w-full min-w-[650px]">

            <thead>
              <tr className="border-b">
                <th className="px-3 py-2 text-left text-xs">
                  Client
                </th>
                <th className="px-3 py-2 text-left text-xs">
                  Phone
                </th>
                <th className="px-3 py-2 text-left text-xs">
                  Type
                </th>
                <th className="px-3 py-2 text-left text-xs">
                  Date Sent
                </th>
                <th className="px-3 py-2 text-left text-xs">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>

              {filtered.map((log) => (

                <tr
                  key={log.id}
                  className="border-b"
                >

                  <td className="px-3 py-3 text-sm">
                    {log.client_name}
                  </td>

                  <td className="px-3 py-3 text-sm text-muted-foreground">
                    {log.phone}
                  </td>

                  <td className="px-3 py-3">
                    <Badge className={typeColor[log.message_type]}>
                      {typeLabels[log.message_type]}
                    </Badge>
                  </td>

                  <td className="px-3 py-3 text-sm text-muted-foreground">
                    {log.date_sent}
                  </td>

                  <td className="px-3 py-3">
                    <Badge
                      className={`${statusColor[log.status]} flex items-center gap-1`}
                    >
                      {statusIcon[log.status]}
                      {log.status}
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
