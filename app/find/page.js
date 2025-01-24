"use client"

import { Search, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { set } from "date-fns"

export default function Page() {
  const supabase = createClient()

  const [rides, setRides] = useState([])

  useEffect(() => {
    getRides().then((rides) => {
      setRides(rides)
      console.log(rides)
    })

  }, [])

  

  async function getRides() {
    let { data: rides, error } = await supabase
      .from('rides')
      .select('*')

    return rides
  }

  
  return (
    <div className="min-h-screen">
      {/* Search Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-black/50" />
              <Input placeholder="From" className="pl-9 border-black/20" />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-black/50" />
              <Input placeholder="To" className="pl-9 border-black/20" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-black/50" />
              <Input placeholder="When" className="pl-9 border-black/20" />
            </div>
          </div>
          <Button className="mt-4 w-full bg-black text-white hover:bg-black/90">Search</Button>
        </div>

        {/* Results */}
        <div className="mt-8 space-y-4">
          {rides.map((ride, i) => (
            <Card key={i} className="bg-white">
              <CardContent className="flex items-center gap-4 p-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>DR</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{ride.startingCity} to {ride.ishaYogaCenter}</h3>
                    <Badge variant="outline" className="border-black text-black">
                      12:00pm
                    </Badge>
                  </div>
                  <div className="text-sm text-black/60">Pickup: {ride.startingPoint}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${ride.pricePerSeat}</div>
                  <div className="text-sm text-black/60">{ride.seats} seats left</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

