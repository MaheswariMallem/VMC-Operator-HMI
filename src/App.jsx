import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [stage, setStage] = useState("machine");

  const [machineChecks, setMachineChecks] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const [tools, setTools] = useState([
    false,
    false,
    false,
  ]);

  const [workpiece, setWorkpiece] = useState([
    false,
    false,
    false,
    false,
  ]);

  const [status, setStatus] = useState("READY");

  const allMachineChecked = machineChecks.every(Boolean);
  const allToolsChecked = tools.every(Boolean);
  const allWorkpieceChecked = workpiece.every(Boolean);

  useEffect(() => {
    fetch("http://localhost:5000/api/state")
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          setStatus(data.status);
        }
      })
      .catch(() => {
        console.log("API not connected");
      });
  }, []);

  const saveState = async (data) => {
    try {
      await fetch("http://localhost:5000/api/state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.log("API error:", error);
    }
  };

  const toggleMachine = (index) => {
    const updated = [...machineChecks];
    updated[index] = !updated[index];
    setMachineChecks(updated);

    saveState({
      machineChecks: updated.every(Boolean),
    });
  };

  const toggleTool = (index) => {
    const updated = [...tools];
    updated[index] = !updated[index];
    setTools(updated);

    saveState({
      tools: updated.every(Boolean),
    });
  };

  const toggleWorkpiece = (index) => {
    const updated = [...workpiece];
    updated[index] = !updated[index];
    setWorkpiece(updated);

    saveState({
      workpiece: updated.every(Boolean),
    });
  };

  const startOperation = async () => {
    setStatus("RUNNING");
    setStage("operation");

    await saveState({
      status: "RUNNING",
    });
  };

  const stopOperation = async () => {
    setStatus("STOPPED");

    await saveState({
      status: "STOPPED",
    });
  };

  return (
    <div className="container">
      <h1>VMC Operator HMI</h1>

      {/* MACHINE CHECKS */}
      {stage === "machine" && (
        <>
          <h2>1. Machine Checks</h2>

          {[
            "Power / Control available",
            "E-Stop released",
            "Guard / Door closed",
            "No active alarm",
            "Lubrication / Coolant ready",
            "Reference return complete",
          ].map((item, index) => (
            <label key={index} className="check-row">
              <input
                type="checkbox"
                checked={machineChecks[index]}
                onChange={() => toggleMachine(index)}
              />
              {item}
            </label>
          ))}

          {allMachineChecked && (
            <button onClick={() => setStage("tools")}>
              Next
            </button>
          )}
        </>
      )}

      {/* TOOLS */}
      {stage === "tools" && (
        <>
          <h2>2. Tool Checks</h2>

          {[
            "Tool magazine ready",
            "Correct tools loaded",
            "Tool offsets verified",
          ].map((item, index) => (
            <label key={index} className="check-row">
              <input
                type="checkbox"
                checked={tools[index]}
                onChange={() => toggleTool(index)}
              />
              {item}
            </label>
          ))}

          {allToolsChecked && (
            <button onClick={() => setStage("workpiece")}>
              Next
            </button>
          )}
        </>
      )}

      {/* WORKPIECE */}
      {stage === "workpiece" && (
        <>
          <h2>3. Workpiece Setup</h2>

          {[
            "Workpiece loaded",
            "Clamp tight",
            "Work offset set",
            "Program selected",
          ].map((item, index) => (
            <label key={index} className="check-row">
              <input
                type="checkbox"
                checked={workpiece[index]}
                onChange={() => toggleWorkpiece(index)}
              />
              {item}
            </label>
          ))}

          {allWorkpieceChecked && (
            <button onClick={() => setStage("ready")}>
              Next
            </button>
          )}
        </>
      )}

      {/* READY */}
      {stage === "ready" && (
        <>
          <h2>4. Ready</h2>

          <p>All machine checks completed.</p>
          <p>All tool checks completed.</p>
          <p>All workpiece checks completed.</p>

          <h1>STATUS: READY</h1>

          <button onClick={startOperation}>
            Start Operation
          </button>
        </>
      )}

      {/* OPERATION */}
      {stage === "operation" && (
        <>
          <h2>5. Operation</h2>

          <p>Operation: VMC Milling</p>

          <h1>STATUS: {status}</h1>

          {status === "RUNNING" ? (
            <button onClick={stopOperation}>
              Stop Operation
            </button>
          ) : (
            <button onClick={startOperation}>
              Start Operation
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default App;