import { useFormContext } from 'react-hook-form'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PricingStep() {
  const { register } = useFormContext()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          {...register("firstName", { required: "First name is required" })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          {...register("lastName", { required: "Last name is required" })}
        />
      </div>
    </div>
  )
}

