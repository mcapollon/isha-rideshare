import { useFormContext } from 'react-hook-form'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PersonalInfoStep() {
  const { register } = useFormContext()

  return (
    (<div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          {...register("firstName", { required: "First name is required" })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          {...register("lastName", { required: "Last name is required" })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sex">Sex</Label>
        <select
          id="sex"
          {...register("sex", { required: "Sex is required" })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        >
          <option value="">Select...</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
      </div>
    </div>)
  );
}

