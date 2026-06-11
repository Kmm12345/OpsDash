import { useEffect, useState } from "react";
import { api } from "./api";
import "./App.css";
import IncidentSeverityChart from "./components/IncidentSeverityChart";
import { Link } from "react-router-dom";

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
  application_id: number;
  root_cause?: string;
};

function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    api.get("/applications").then((res) => setApplications(res.data));
    api.get("/incidents").then((res) => setIncidents(res.data));
  }, []);

  const healthy = applications.filter((app) => app.status === "Healthy").length;
  const degraded = applications.filter((app) => app.status === "Degraded").length;
  const down = applications.filter((app) => app.status === "Down").length;
  const openIncidents = incidents.filter((i) => i.status !== "Resolved").length;

  return (
    <div className="page">
      <h1>OpsPulse</h1>
      <p>SRE Operations Dashboard</p>

      <div className="cards">
        <div className="card">
          <h2>{applications.length}</h2>
          <p>Total Applications</p>
        </div>
        <div className="card">
          <h2>{healthy}</h2>
          <p>Healthy</p>
        </div>
        <div className="card">
          <h2>{degraded}</h2>
          <p>Degraded</p>
        </div>
        <div className="card">
          <h2>{down}</h2>
          <p>Down</p>
        </div>
        <div className="card">
          <h2>{openIncidents}</h2>
          <p>Open Incidents</p>
        </div>
      </div>

      <h2>Incident Severity Distribution</h2>
      <div className="chart-container">
        <IncidentSeverityChart incidents={incidents} />
      </div>

      <h2>Applications</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Environment</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Last Checked</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>
                <Link to={`/application/${app.id}`}>
                  {app.name}
                </Link>
              </td>
              <td>{app.environment}</td>
              <td>{app.owner}</td>
              <td>
                <span className={`badge status-${app.status.toLowerCase()}`}>
                  {app.status}
                </span>
              </td>
              <td>{new Date(app.last_checked).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Incidents</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Application ID</th>
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
                <span className="badge status-open">
                  {incident.status}
                </span>
              </td>
              <td>{incident.application_id}</td>
              <td>{incident.root_cause || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;