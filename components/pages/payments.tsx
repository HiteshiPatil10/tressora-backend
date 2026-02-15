"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  CreditCard,
  Download,
  DollarSign,
  FileText,
  Banknote,
  Smartphone,
} from "lucide-react"

export function PaymentsPage() {

  const [invoices, setInvoices] = useState<any[]>([])
  const [filterMethod, setFilterMethod] = useState("all")

  useEffect(() => {
    fetchInvoices()
  }, [])

  async function fetchInvoices() {

    const { data } = await supabase
      .from("appointments")
      .select(`
        id,
        client_name,
        appointment_date,
        payment_method,
        services(name, price),
        barbers(name)
      `)
      .eq("status", "completed")

    const mapped = (data || []).map((a: any, i: number) => ({
      id: a.id,
      invoiceId: `INV-${1000 + i}`,
      clientName: a.client_name,
      services: [a.services?.name],
      barber: a.barbers?.name,
      paymentMethod: a.payment_method,
      date: a.appointment_date,
      amount: a.services?.price || 0,
    }))

    setInvoices(mapped)
  }

  const filtered = invoices.filter((inv) => {
    if (filterMethod !== "all" && inv.paymentMethod !== filterMethod)
      return false
    return true
  })

  const totalAmount = filtered.reduce((s, i) => s + i.amount, 0)
  const cashAmount = invoices
    .filter((i) => i.paymentMethod === "cash")
    .reduce((s, i) => s + i.amount, 0)

  const cardAmount = invoices
    .filter((i) => i.paymentMethod === "card")
    .reduce((s, i) => s + i.amount, 0)

  const upiAmount = invoices
    .filter((i) => i.paymentMethod === "upi")
    .reduce((s, i) => s + i.amount, 0)

  const methodIcon: Record<string, React.ReactNode> = {
    cash: <Banknote className="h-4 w-4" />,
    card: <CreditCard className="h-4 w-4" />,
    upi: <Smartphone className="h-4 w-4" />,
    online: <DollarSign className="h-4 w-4" />,
  }

  const methodColor: Record<string, string> = {
    cash: "bg-emerald-100 text-emerald-700",
    card: "bg-blue-100 text-blue-700",
    upi: "bg-amber-100 text-amber-700",
    online: "bg-primary/10 text-primary",
  }

  function downloadInvoice(invoice: any) {
    alert(
      `Downloading PDF for ${invoice.invoiceId} - ${invoice.clientName}`
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold">
          Payments & Billing
        </h1>
        <p className="text-sm text-muted-foreground">
          View invoices and payment summaries
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        {[
          {
            label: "Total Revenue",
            value: `₹${totalAmount.toLocaleString()}`,
            icon: DollarSign,
          },
          {
            label: "Cash",
            value: `₹${cashAmount.toLocaleString()}`,
            icon: Banknote,
          },
          {
            label: "Card",
            value: `₹${cardAmount.toLocaleString()}`,
            icon: CreditCard,
          },
          {
            label: "UPI",
            value: `₹${upiAmount.toLocaleString()}`,
            icon: Smartphone,
          },
        ].map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <Icon className="h-5 w-5" />
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
          )
        })}

      </div>

      {/* Filter */}
      <Card>
        <CardContent className="flex items-center gap-3 p-4">

          <Select
            value={filterMethod}
            onValueChange={setFilterMethod}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment method" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="online">Online</SelectItem>
            </SelectContent>

          </Select>

          <Badge>{filtered.length} invoices</Badge>

        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2">
            <FileText className="h-4 w-4" />
            Invoices
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[750px]">

            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-b">

                  <td>{inv.invoiceId}</td>
                  <td>{inv.clientName}</td>
                  <td>{inv.services.join(", ")}</td>
                  <td>{inv.barber}</td>

                  <td>
                    <Badge
                      className={`${methodColor[inv.paymentMethod]} flex gap-1`}
                    >
                      {methodIcon[inv.paymentMethod]}
                      {inv.paymentMethod}
                    </Badge>
                  </td>

                  <td>{inv.date}</td>

                  <td className="text-right">
                    ₹{inv.amount}
                  </td>

                  <td className="text-right">
                    <Button
                      size="sm"
                      onClick={() => downloadInvoice(inv)}
                    >
                      <Download className="mr-1 h-3 w-3" />
                      PDF
                    </Button>
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
