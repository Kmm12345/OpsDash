import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

type Incident = {
  id: number;
  title: string;
  severity: string;
};

type Props = {
  incidents: Incident[];
};

export default function IncidentSeverityChart({ incidents }: Props) {
  const counts = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };

  incidents.forEach((incident) => {
    if (incident.severity in counts) {
      counts[incident.severity as keyof typeof counts]++;
    }
  });

  const data = [
    { name: "Critical", value: counts.Critical },
    { name: "High", value: counts.High },
    { name: "Medium", value: counts.Medium },
    { name: "Low", value: counts.Low },
  ];

  const COLORS = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#3b82f6",
  ];

  return (
    <PieChart width={500} height={300}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        outerRadius={100}
      >
        {data.map((entry, index) => (
          <Cell
            key={entry.name}
            fill={COLORS[index]}
          />
        ))}
      </Pie>

      <Tooltip />
      <Legend />
    </PieChart>
  );
}