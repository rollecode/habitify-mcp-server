import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_KEY = process.env.HABITIFY_API_KEY || "";
const BASE = "https://api.habitify.me";

async function api(path: string, method = "GET", body?: any) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: API_KEY,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

const server = new McpServer({ name: "habitify", version: "1.0.0" });

server.tool(
  "habitify_list_habits",
  "List all habits with their current status",
  {},
  async () => {
    const data = await api("/habits");
    const habits = (data.data || []).map((h: any) => ({
      id: h.id,
      name: h.name,
      area: h.area?.name,
      goal: h.goal,
      status: h.status,
    }));
    return { content: [{ type: "text", text: JSON.stringify(habits, null, 2) }] };
  }
);

server.tool(
  "habitify_get_status",
  "Get today's completion status for all habits",
  {
    date: z.string().optional().describe("Date in YYYY-MM-DD format, defaults to today"),
  },
  async (args) => {
    const date = args.date || new Date().toISOString().split("T")[0];
    const data = await api(`/habits?date=${date}T00:00:00`);
    const habits = (data.data || []).map((h: any) => ({
      name: h.name,
      status: h.status,
      progress: h.progress,
    }));
    return { content: [{ type: "text", text: JSON.stringify(habits, null, 2) }] };
  }
);

server.tool(
  "habitify_get_logs",
  "Get log entries for a specific habit",
  {
    habit_id: z.string().describe("The habit ID"),
    from: z.string().optional().describe("Start date YYYY-MM-DD"),
    to: z.string().optional().describe("End date YYYY-MM-DD"),
  },
  async (args) => {
    let path = `/logs/${args.habit_id}`;
    const params: string[] = [];
    if (args.from) params.push(`from=${args.from}T00:00:00`);
    if (args.to) params.push(`to=${args.to}T23:59:59`);
    if (params.length) path += `?${params.join("&")}`;
    const data = await api(path);
    return { content: [{ type: "text", text: JSON.stringify(data.data || [], null, 2) }] };
  }
);

server.tool(
  "habitify_complete_habit",
  "Mark a habit as done for today",
  {
    habit_id: z.string().describe("The habit ID to mark as done"),
    value: z.number().optional().describe("Value for measurable habits (e.g. ml of water, km ran)"),
  },
  async (args) => {
    const now = new Date().toISOString();
    const body: any = { target_date: now };
    if (args.value !== undefined) body.value = args.value;
    const data = await api(`/logs/${args.habit_id}`, "POST", body);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
