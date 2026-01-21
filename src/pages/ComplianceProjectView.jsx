/**
 * ComplianceProjectView.jsx
 * Page wrapper for Q&A compliance projects
 *
 * @location src/pages/ComplianceProjectView.jsx
 */

import { useParams } from 'react-router-dom'
import { ComplianceProjectEditor } from '../components/compliance'

export default function ComplianceProjectView() {
  const { id } = useParams()

  return <ComplianceProjectEditor projectId={id} />
}
