import { useState } from "react";
import FormBuilder from "./components/FormBuilder";
import DataTable from "./components/DataTable";

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Dynamic Form Builder + Data Grid</h1>
      <FormBuilder />
      <hr />
      <DataTable />
    </div>
  );
}

export default App;
