"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

import { Card, CardContent } from "@/components/ui/card"
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

import { Tag, Plus, Send, Calendar, Copy } from "lucide-react"

export function OffersPage() {

  const [offersList, setOffersList] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])

  const [showAddModal, setShowAddModal] = useState(false)

  const [newOffer, setNewOffer] = useState({
    title: "",
    discount: "",
    validTill: "",
    code: "",
    services: [] as string[],
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {

    const { data: offers } = await supabase
      .from("offers")
      .select("*")
      .order("created_at", { ascending: false })

    const { data: srv } = await supabase
      .from("services")
      .select("*")
      .eq("active", true)

    setOffersList(offers || [])
    setServices(srv || [])
  }

  async function handleAddOffer() {

    if (
      !newOffer.title ||
      !newOffer.discount ||
      !newOffer.validTill ||
      !newOffer.code
    )
      return

    await supabase.from("offers").insert([
      {
        title: newOffer.title,
        discount: parseInt(newOffer.discount),
        valid_till: newOffer.validTill,
        code: newOffer.code.toUpperCase(),
        services: newOffer.services,
        status: "active",
      },
    ])

    setShowAddModal(false)

    setNewOffer({
      title: "",
      discount: "",
      validTill: "",
      code: "",
      services: [],
    })

    fetchData()
  }

  function broadcastOffer(offer: any) {
    alert(
      `WhatsApp broadcast sent for "${offer.title}" (${offer.code})`
    )
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    alert(`Code "${code}" copied!`)
  }

  const statusColor: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    expired: "bg-red-100 text-red-700",
    scheduled: "bg-blue-100 text-blue-700",
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">
            Offers & Campaigns
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage promotional offers
          </p>
        </div>

        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Offer
        </Button>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

        {offersList.map((offer) => (

          <Card key={offer.id}>
            <CardContent className="p-5">

              <div className="flex justify-between">

                <div>
                  <h3 className="font-semibold">
                    {offer.title}
                  </h3>

                  <Badge
                    className={`mt-1 ${statusColor[offer.status]}`}
                  >
                    {offer.status}
                  </Badge>
                </div>

                <div className="rounded-xl bg-primary/10 px-4 py-2 text-center">
                  <span className="text-xl font-bold text-primary">
                    {offer.discount}%
                  </span>
                </div>

              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                <Calendar className="inline mr-1 h-3 w-3" />
                Valid till {offer.valid_till}
              </div>

              <button
                onClick={() => copyCode(offer.code)}
                className="mt-2 flex items-center gap-1 rounded border border-dashed px-3 py-1 text-sm font-mono"
              >
                {offer.code}
                <Copy className="h-3 w-3" />
              </button>

              <div className="mt-3 flex flex-wrap gap-1">

                {(offer.services || []).map((s: string) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}

              </div>

              {offer.status === "active" && (
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => broadcastOffer(offer)}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Broadcast
                </Button>
              )}

            </CardContent>
          </Card>

        ))}
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>

          <DialogHeader>
            <DialogTitle>Create Offer</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">

            <Input
              placeholder="Offer Title"
              value={newOffer.title}
              onChange={(e) =>
                setNewOffer({
                  ...newOffer,
                  title: e.target.value,
                })
              }
            />

            <Input
              type="number"
              placeholder="Discount %"
              value={newOffer.discount}
              onChange={(e) =>
                setNewOffer({
                  ...newOffer,
                  discount: e.target.value,
                })
              }
            />

            <Input
              placeholder="Promo Code"
              value={newOffer.code}
              onChange={(e) =>
                setNewOffer({
                  ...newOffer,
                  code: e.target.value,
                })
              }
            />

            <Input
              type="date"
              value={newOffer.validTill}
              onChange={(e) =>
                setNewOffer({
                  ...newOffer,
                  validTill: e.target.value,
                })
              }
            />

            <Select
              onValueChange={(v) =>
                setNewOffer({
                  ...newOffer,
                  services: [
                    ...newOffer.services,
                    v,
                  ],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Add Service" />
              </SelectTrigger>

              <SelectContent>
                {services.map((s) => (
                  <SelectItem
                    key={s.id}
                    value={s.name}
                  >
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>

          <DialogFooter>
            <Button onClick={handleAddOffer}>
              Create Offer
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>
  )
}
