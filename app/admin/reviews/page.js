'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Flag, 
  Eye, 
  Search, 
  Filter,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react'

export default function AdminReviewFlags() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentReport, setCurrentReport] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [filter, setFilter] = useState('pending') // 'pending', 'approved', 'rejected', 'all'
  const [sortField, setSortField] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('desc')
  const supabase = createClient()

  useEffect(() => {
    async function fetchReports() {
      setLoading(true)
      
      try {
        let query = supabase
          .from('review_flags')
          .select(`
            *,
            review:review_id(id, rating, comment, created_at, driver_id, reviewer_id),
            reporter:reporter_id(id, name, email),
            reviewer:reviewed_by(id, name, email)
          `)
          .order(sortField, { ascending: sortDirection === 'asc' })
        
        // Apply filter
        if (filter !== 'all') {
          query = query.eq('status', filter)
        }
        
        const { data, error } = await query
        
        if (error) {
          console.error('Error fetching reports:', error)
          return
        }
        
        // Now get reviewer and driver information for each review
        const reportsWithDetails = await Promise.all(
          data.map(async (report) => {
            if (!report.review) return report
            
            // Get reviewer and driver details
            const reviewerId = report.review.reviewer_id
            const driverId = report.review.driver_id
            
            const [reviewerResult, driverResult] = await Promise.all([
              supabase.schema('next_auth').from('users').select('name, image').eq('id', reviewerId).single(),
              supabase.schema('next_auth').from('users').select('name, image').eq('id', driverId).single()
            ])
            
            return {
              ...report,
              review: {
                ...report.review,
                reviewer: reviewerResult.data,
                driver: driverResult.data
              }
            }
          })
        )
        
        setReports(reportsWithDetails)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchReports()
  }, [filter, sortField, sortDirection])

  const handleViewReport = (report) => {
    setCurrentReport(report)
    setShowDetailsModal(true)
  }

  const handleUpdateStatus = async (reportId, status) => {
    try {
      const { error } = await supabase
        .from('review_flags')
        .update({ 
          status, 
          reviewed_by: supabase.auth.getUser().then(res => res.data.user.id), 
          reviewed_at: new Date().toISOString() 
        })
        .eq('id', reportId)
      
      if (error) {
        console.error('Error updating report:', error)
        return
      }
      
      // If approved (hide review), update the driver_reviews table
      if (status === 'approved' && currentReport?.review?.id) {
        const { error: hideError } = await supabase
          .from('driver_reviews')
          .update({ is_hidden: true })
          .eq('id', currentReport.review.id)
        
        if (hideError) {
          console.error('Error hiding review:', hideError)
        }
      }
      
      // Update the local state
      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, status } : r
      ))
      
      setShowDetailsModal(false)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc') // Default to descending for new sort field
    }
  }

  const StatusBadge = ({ status }) => {
    const statusProps = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <AlertTriangle className="w-4 h-4 mr-1" /> },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4 mr-1" /> },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-4 h-4 mr-1" /> }
    }
    
    const { bg, text, icon } = statusProps[status] || statusProps.pending
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Review Reports</h1>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Filter className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Reports</option>
            </select>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center">
                  Date Reported
                  {getSortIcon('created_at')}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Review
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                  </div>
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No reports found.
                </td>
              </tr>
            ) : (
              reports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(report.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {report.review ? (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.review.reviewer?.name || 'Anonymous'}</span>
                        <span>rated</span>
                        <span className="font-medium">{report.review.driver?.name || 'Driver'}</span>
                        <span className="font-medium text-amber-600">{report.review.rating}/5</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Review not found</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {report.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleViewReport(report)}
                      className="text-amber-600 hover:text-amber-800 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Report Details Modal */}
      {showDetailsModal && currentReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center">
                <Flag className="w-5 h-5 mr-2 text-amber-600" />
                Report Details
              </h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2">Report Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Date Reported</div>
                      <div>{format(new Date(currentReport.created_at), 'PPP p')}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Reported By</div>
                      <div>{currentReport.reporter?.name || 'Unknown'}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Reason</div>
                      <div>{currentReport.reason}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Status</div>
                      <div>
                        <StatusBadge status={currentReport.status} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {currentReport.details && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2">Additional Details</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{currentReport.details}</p>
                    </div>
                  </div>
                )}
                
                {currentReport.review && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2">Reported Review</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                          {currentReport.review.reviewer?.image ? (
                            <img 
                              src={currentReport.review.reviewer.image} 
                              alt={currentReport.review.reviewer.name || 'Reviewer'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-amber-100 text-amber-800 font-medium">
                              {(currentReport.review.reviewer?.name?.[0] || 'U')}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{currentReport.review.reviewer?.name || 'Anonymous'}</div>
                          <div className="text-amber-600 font-medium">{currentReport.review.rating}/5 stars</div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(currentReport.review.created_at), 'PPP')}
                          </div>
                        </div>
                      </div>
                      
                      {currentReport.review.comment && (
                        <div className="bg-white p-3 rounded border mt-2">
                          <p className="text-gray-700">{currentReport.review.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {currentReport.status === 'pending' && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-start text-gray-500">
                      <Info className="w-5 h-5 mr-2 flex-shrink-0" />
                      <p className="text-sm">
                        Approving this report will hide the review from all public view. 
                        Rejecting will keep the review visible. This action cannot be undone.
                      </p>
                    </div>
                    <div className="space-x-3">
                      <button
                        onClick={() => handleUpdateStatus(currentReport.id, 'rejected')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Reject Report
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(currentReport.id, 'approved')}
                        className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                      >
                        Approve & Hide Review
                      </button>
                    </div>
                  </div>
                )}
                
                {currentReport.status !== 'pending' && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2">Review Decision</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Decision Date</div>
                        <div>{currentReport.reviewed_at ? format(new Date(currentReport.reviewed_at), 'PPP p') : 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Reviewed By</div>
                        <div>{currentReport.reviewer?.name || 'Unknown'}</div>
                      </div>
                    </div>
                    {currentReport.admin_notes && (
                      <div className="mt-4">
                        <div className="text-sm font-medium text-gray-500">Admin Notes</div>
                        <div className="bg-white p-3 rounded border mt-1">
                          <p className="text-gray-700">{currentReport.admin_notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}