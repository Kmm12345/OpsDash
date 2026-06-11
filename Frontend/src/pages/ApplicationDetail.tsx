import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";

type Application = {
  id: number;
  name: string;
  environment: string;
  owner: string;
  status: string;
  last_checked: string;
};

type Incident = {
  id: number;
  title: string;
  severity: string;
  status: string;
  root_cause?: string;
};

function ApplicationDetail() {
  const { id } = useParams();

  const [application, setApplication] = useState<Application | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [status, setStatus] = useState("Open");
  const [rootCause, setRootCause] = useState("");

  useEffect(() => {
    api.get(`/applications/${id}`).then((response) => setApplication(response.data));

    api
      .get(`/applications/${id}/incidents`)
      .then((response) => setIncidents(response.data));
  }, [id]);

  const createIncident = async () => {
    await api.post("/incidents", {
      title,
      severity,
      status,
      application_id: Number(id),
      root_cause: rootCause,
    });

    const response = await api.get(`/applications/${id}/incidents`);
    setIncidents(response.data);

    setTitle("");
    setSeverity("Medium");
    setStatus("Open");
    setRootCause("");
  };

  if (!application) {
    return <div className="page">Loading...</div>;
  }

  return (
    <div className="page">
      <Link to="/">← Back to Dashboard</Link>

      <h1>{application.name}</h1>

      <div className="card">
        <p><strong>Environment:</strong> {application.environment}</p>
        <p><strong>Owner:</strong> {application.owner}</p>
        <p><strong>Status:</strong> {application.status}</p>
        <p>
          <strong>Last Checked:</strong>{" "}
          {new Date(application.last_checked).toLocaleString()}
        </p>
      </div>

      <h2>Create Incident</h2>

      <div className="card">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <br /><br />

        <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <br /><br />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>Open</option>
          <option>Investigating</option>
          <option>Mitigating</option>
          <option>Monitoring</option>
          <option>Resolved</option>
        </select>

        <br /><br />

        <textarea
          placeholder="Root Cause"
          value={rootCause}
          onChange={(e) => setRootCause(e.target.value)}
        />

        <br /><br />

        <button onClick={createIncident}>Create Incident</button>
      </div>

      <h2>Related Incidents</h2>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Root Cause</th>
          </tr>
        </thead>

        <tbody>
          {incidents.map((incident) => (
            <tr key={incident.id}>
              <td>{incident.title}</td>

              <td>
                <span className={`badge severity-${incident.severity.toLowerCase()}`}>
                  {incident.severity}
                </span>
              </td>

              <td>
                <span className="badge status-open">{incident.status}</span>
              </td>

              <td>{incident.root_cause || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ApplicationDetail;