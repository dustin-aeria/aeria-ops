import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FolderKanban } from 'lucide-react'

export default function ProjectView() {
  const { projectId } = useParams()

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link 
        to="/projects" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      {/* Placeholder */}
      <div className="card text-center py-12">
        <FolderKanban className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Project View</h3>
        <p className="text-gray-500">
          Project ID: {projectId}
        </p>
        <p className="text-gray-400 text-sm mt-2">
          The full project editor will be implemented here.
        </p>
      </div>
    </div>
  )
}
