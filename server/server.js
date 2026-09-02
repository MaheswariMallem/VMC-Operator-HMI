import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

let hmiState = {
  machineChecks: false,
  tools: false,
  workpiece: false,
  status: "READY",
};

app.get("/api/state", (req, res) => {
  res.json(hmiState);
});

app.post("/api/state", (req, res) => {
  hmiState = {
    ...hmiState,
    ...req.body,
  };

  res.json(hmiState);
});

app.listen(5000, () => {
  console.log("HMI API running on port 5000");
});