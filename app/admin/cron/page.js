'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function AdminCronPage() {
  const { data: session } = useSession()
  const [status, setStatus] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Admin protection - add your admin user IDs here
  const adminUserIds = ['ce501b9a-ee5e-474e-a8a4-4c39947b504f']
  
  if (!session?.user?.id || !adminUserIds.includes(session.user.id)) {
    redirect('/')
  }
  
  const triggerPayoutProcessing = async () => {
    setIsProcessing(true)
    setStatus(null)
    
    try {
      const response = await fetch('/api/cron/process-payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_DEV_TOKEN || '8KDPc2VhMN7xFJtR9bZ6gLqY4sEw5ATuXGj3WQveCkHp'}`
        }
      })
      
      const result = await response.json()
      
      setStatus({
        success: response.ok,
        data: result
      })
    } catch (error) {
      setStatus({
        success: false,
        error: error.message
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Admin: Cron Job Controls</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Process Driver Payouts</h2>
        <p className="text-gray-600 mb-4">
          This will process all scheduled payouts that are due today.
          In production, this runs automatically every day at midnight.
        </p>
        
        <button
          onClick={triggerPayoutProcessing}
          disabled={isProcessing}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Process Payouts Now'}
        </button>
      </div>
      
      {status && (
        <div className={`border rounded-lg p-4 ${status.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <h3 className={`font-medium ${status.success ? 'text-green-800' : 'text-red-800'}`}>
            {status.success ? 'Success!' : 'Error'}
          </h3>
          
          <pre className="mt-2 p-4 bg-white rounded text-sm overflow-x-auto">
            {JSON.stringify(status.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}