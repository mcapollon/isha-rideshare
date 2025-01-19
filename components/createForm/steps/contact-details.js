import { useFormContext } from 'react-hook-form'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ContactDetailsStep() {
  const { register } = useFormContext()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email", { 
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address"
            }
          })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          {...register("phone", { 
            required: "Phone number is required",
            pattern: {
              value: /^[0-9]{10}$/,
              message: "Invalid phone number, should be 10 digits"
            }
          })}
        />
      </div>
    </div>
  )
}

