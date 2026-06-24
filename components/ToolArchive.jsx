import { tools } from '../data/siteContent'

export default function ToolArchive() {
  return (
    <div className="tool-archive">
      {tools.map((tool) => (
        <a key={tool.href} href={tool.href} className="tool-card">
          <span>{tool.category}</span>
          <div>
            <strong>{tool.title}</strong>
            <em>{tool.href}</em>
          </div>
          <p>{tool.body}</p>
        </a>
      ))}
    </div>
  )
}
