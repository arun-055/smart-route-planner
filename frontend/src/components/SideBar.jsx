
import React, { useMemo, useState } from 'react'
import graph from '../data/graph.json'

export default function Sidebar({
  startNodeId,
  endNodeId,
  setStartNodeId,
  setEndNodeId,
  setShortest,
  setFastest
}) {
  const [loading, setLoading] = useState(false)
  const nodes = useMemo(() => graph.nodes, [])
  const API = import.meta.env.VITE_API_BASE || "/api";



  function selectStart(e) {
    const id = Number(e.target.value)
    setStartNodeId(id || null)
  }

  function selectEnd(e) {
    const id = Number(e.target.value)
    setEndNodeId(id || null)
  }

  async function computeRoutes() {
    if (!startNodeId || !endNodeId) {
      alert("Select Start and End nodes first.")
      return
    }

    setLoading(true)

    try {
      const res1 = await fetch(`${API}/route/distance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startId: startNodeId, endId: endNodeId })
      })
      if (!res1.ok) throw new Error("Error in distance route")
      const shortest = await res1.json()

      const res2 = await fetch(`${API}/route/fastest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startId: startNodeId, endId: endNodeId })
      })
      if (!res2.ok) throw new Error("Error in fastest route")
      const fastest = await res2.json()

      setShortest(shortest)
      setFastest(fastest)
    } catch (err) {
      console.error(err)
      alert("Backend not running or API error.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sidebar">

      <h2  style={{
    fontSize: "28px",
    fontWeight: 700,
    color: "#005eff",
    letterSpacing: "-0.3px",
    backgroundColor: "#aac4f5",
    padding: "10px 14px",
    borderRadius: "10px",
    display: "inline-block",
  }}>Smart Route Planner</h2>
      <p>Click on the map to pick Start & End (nearest graph node).</p>


      <div style={{ marginTop: 10 }}>
        <label>Start Node</label>
        <select
          value={startNodeId || ""}
          onChange={selectStart}
          style={{ width: "100%", padding: "6px" }}
        >
          <option value="">-- select start --</option>
          {nodes.map(n => (
            <option key={n.id} value={n.id}>Node {n.id}</option>
          ))}
        </select>
      </div>


      <div style={{ marginTop: 10 }}>
        <label>End Node</label>
        <select
          value={endNodeId || ""}
          onChange={selectEnd}
          style={{ width: "100%", padding: "6px" }}
        >
          <option value="">-- select end --</option>
          {nodes.map(n => (
            <option key={n.id} value={n.id}>Node {n.id}</option>
          ))}
        </select>
      </div>

      <button
        className="btn"
        onClick={computeRoutes}
        disabled={loading}
        style={{ marginTop: 12, width: "100%" }}
      >
        {loading ? "Computing..." : "Compute Routes"}
      </button>
      <button
  className="btn"
  onClick={() => {
    setStartNodeId(null);
    setEndNodeId(null);
    setShortest(null);
    setFastest(null);
  }}
  style={{
    marginTop: 10,
    width: "100%",
    background: "#6b7280"
  }}
>
  Reset
</button>


      <div style={{ marginTop: 12 }}>
        <div>🔵 Shortest Route (Distance)</div>
        <div>🔴 Fastest Route (Time)</div>
      </div>

      <div style={{ marginTop: 10 }}>
        <small>Nodes: {nodes.length} | Edges: {graph.edges.length}</small>
      </div>
    </div>
  )
}
