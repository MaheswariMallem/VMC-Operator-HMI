import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "https://vmc-operator-hmi-api-y871.onrender.com";

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

  const [tools, setTools] = useState([false, false, false]);

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
    fetch('${API_URL}/api/state')
      .then((response) => response.json())
      .then((data) => {
        if (data.status) {
          setStatus(data.status);
        }
      })
      .catch((error) => {
        console.log("API not connected:", error);
      });
  }, []);

  const saveState = async (data) => {
    try {
      await fetch('${API_URL}/api/state', {
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
    const updatedChecks = [...machineChecks];

    updatedChecks[index] = !updatedChecks[index];

    setMachineChecks(updatedChecks);

    saveState({
      machineChecks: updatedChecks.every(Boolean),
    });
  };

  const toggleTool = (index) => {
    const updatedTools = [...tools];

    updatedTools[index] = !updatedTools[index];

    setTools(updatedTools);

    saveState({
      tools: updatedTools.every(Boolean),
    });
  };

  const toggleWorkpiece = (index) => {
    const updatedWorkpiece = [...workpiece];

    updatedWorkpiece[index] = !updatedWorkpiece[index];

    setWorkpiece(updatedWorkpiece);

    saveState({
      workpiece: updatedWorkpiece.every(Boolean),
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

      {stage === "machine" && (
        <div>
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
        </div>
      )}

      {stage === "tools" && (
        <div>
          <h2>2. Tool Checks</h2>

          <p>
            CNC Program: <strong>VMC-1001</strong>
          </p>

          <p>
            Program Revision: <strong>Rev A</strong>
          </p>

          {[
            "T01 - 10mm End Mill",
            "T02 - 6mm Drill",
            "T03 - 8mm Spot Drill",
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
        </div>
      )}

      {stage === "workpiece" && (
        <div>
          <h2>3. Workpiece Setup</h2>

          <p>
            Fixture: <strong>Standard VMC Vice</strong>
          </p>

          <p>
            Orientation: <strong>Datum face toward operator</strong>
          </p>

          <p>
            Material: <strong>Aluminium 6061</strong>
          </p>

          <p>
            Drawing Revision: <strong>Rev B</strong>
          </p>

          <p>
            Work Offset: <strong>G54</strong>
          </p>

          {[
            "Workpiece arranged correctly",
            "Workpiece clamped firmly",
            "Work offset G54 verified",
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
        </div>
      )}

      {stage === "ready" && (
        <div>
          <h2>4. Ready Review</h2>

          <p>✓ Machine checks completed</p>
          <p>✓ Tool checks completed</p>
          <p>✓ Workpiece setup completed</p>

          <h1>STATUS: READY</h1>

          <button onClick={startOperation}>
            Start Operation
          </button>
        </div>
      )}

      {stage === "operation" && (
        <div>
          <h2>5. Operation</h2>

          <p>
            Operation: <strong>VMC Milling</strong>
          </p>

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
        </div>
      )}
    </div>
  );
}

export default App;