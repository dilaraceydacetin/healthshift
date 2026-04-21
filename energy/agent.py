from langgraph.graph import StateGraph, END
from typing import TypedDict, List
from core.llm import ask
from sqlalchemy import text
from core.database import engine

class EnergyState(TypedDict):
    building_id: int
    readings: List[dict]
    anomalies: List[dict]
    analysis: str
    recommendations: str

def fetch_readings(state: EnergyState) -> EnergyState:
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT timestamp, kwh, source
            FROM energy_readings
            WHERE building_id = :building_id
            ORDER BY timestamp DESC
            LIMIT 30
        """), {"building_id": state["building_id"]})
        rows = result.fetchall()
    state["readings"] = [
        {"timestamp": str(r[0]), "kwh": r[1], "source": r[2]}
        for r in rows
    ]
    return state

def detect_anomalies(state: EnergyState) -> EnergyState:
    readings = state["readings"]
    if not readings:
        state["anomalies"] = []
        return state
    avg_kwh = sum(r["kwh"] for r in readings) / len(readings)
    anomalies = [
        r for r in readings
        if r["kwh"] > avg_kwh * 1.2
    ]
    state["anomalies"] = anomalies
    return state

def analyze_data(state: EnergyState) -> EnergyState:
    readings = state["readings"]
    anomalies = state["anomalies"]
    if not readings:
        state["analysis"] = "No data available for this building."
        return state
    context = f"""
Building ID: {state['building_id']}
Total readings: {len(readings)}
Average consumption: {sum(r['kwh'] for r in readings) / len(readings):.1f} kWh
Anomalies detected: {len(anomalies)}
Anomaly readings: {anomalies}
All readings: {readings}
"""
    state["analysis"] = ask(
        prompt="Analyze this building's energy consumption pattern. Identify trends and issues.",
        context=context
    )
    return state

def generate_recommendations(state: EnergyState) -> EnergyState:
    context = f"""
Analysis: {state['analysis']}
Anomalies: {state['anomalies']}
"""
    state["recommendations"] = ask(
        prompt="Based on this analysis, provide 3 specific energy saving recommendations.",
        context=context
    )
    return state

def build_agent():
    graph = StateGraph(EnergyState)
    graph.add_node("fetch_readings", fetch_readings)
    graph.add_node("detect_anomalies", detect_anomalies)
    graph.add_node("analyze_data", analyze_data)
    graph.add_node("generate_recommendations", generate_recommendations)
    graph.set_entry_point("fetch_readings")
    graph.add_edge("fetch_readings", "detect_anomalies")
    graph.add_edge("detect_anomalies", "analyze_data")
    graph.add_edge("analyze_data", "generate_recommendations")
    graph.add_edge("generate_recommendations", END)
    return graph.compile()

energy_agent = build_agent()