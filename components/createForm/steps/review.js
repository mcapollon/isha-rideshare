import { useFormContext } from 'react-hook-form'

export default function ReviewStep() {
  const { getValues } = useFormContext()
  const formData = getValues()

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Review Your Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p><strong>Starting Point:</strong> {formData.startingPoint}</p>
          <p><strong>Destination:</strong> {formData.destination}</p>
          <p><strong>Departure:</strong> {formData.departure?.toLocaleString()}</p>
          <p><strong>Number of Seats:</strong> {formData.seats}</p>
          <p><strong>Luggage:</strong> {formData.luggage}</p>
          <p><strong>Description:</strong> {formData.description}</p>
        </div>
        <div>
          <p><strong>First Name:</strong> {formData.firstName}</p>
          <p><strong>Last Name:</strong> {formData.lastName}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Phone:</strong> {formData.phone}</p>
        </div>
      </div>
    </div>
  )
}

