// src/components/FormBuilder.jsx
import { useEffect, useState } from "react";

function newField() {
  return {
    id: crypto.randomUUID(),
    label: "",
    type: "text",         // text | number | date | dropdown
    required: false,
    options: [],          // for dropdown
    min: undefined,       // for number
    max: undefined,
    step: undefined,
  };
}

export default function FormBuilder() {
  const [schema, setSchema] = useState({ title: "My Dynamic Form", fields: [] });
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(null);

  // ✅ Initialize empty values for every field whenever schema changes
  useEffect(() => {
    const init = {};
    for (const f of schema.fields) {
      init[f.id] = ""; // or null if you prefer
    }
    setValues(init);
  }, [schema]);

  const addField = () => {
    setSchema((s) => ({ ...s, fields: [...s.fields, newField()] }));
  };

  const updateField = (id, patch) => {
    setSchema((s) => ({
      ...s,
      fields: s.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));
  };

  const removeField = (id) => {
    setSchema((s) => ({ ...s, fields: s.fields.filter((f) => f.id !== id) }));
  };

  const importFromFirebase = async () => {
    const url = prompt(
      "Paste your Firebase Realtime DB REST URL to a schema JSON (must end with .json):"
    );
    if (!url) return;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!data || !Array.isArray(data.fields)) throw new Error("Invalid schema");
      setSchema({
        title: data.title || "Imported Form",
        fields: data.fields,
      });
      alert("Schema imported successfully!");
    } catch (err) {
      alert("Import failed: " + err.message);
    }
  };

  const downloadSchema = () => {
    const blob = new Blob([JSON.stringify(schema, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "form-schema.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const setVal = (id, v) => setValues((prev) => ({ ...prev, [id]: v }));

  // ✅ Improved submit: validates required fields and includes ALL fields in payload
  const handleSubmit = (e) => {
    e.preventDefault();

    // Required validation
    for (const f of schema.fields) {
      const v = values[f.id];
      if (f.required && (v === undefined || v === "")) {
        alert(`"${f.label || f.id}" is required`);
        return;
      }
    }

    // Build payload including all fields (even if left empty)
    const payload = {};
    for (const f of schema.fields) {
      payload[f.id] = values[f.id] ?? "";
    }
    setSubmitted(payload);
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>{schema.title}</h2>
        <button onClick={addField}>+ Add Field</button>
        <button onClick={downloadSchema}>Download JSON</button>
        <button onClick={importFromFirebase}>Import from Firebase</button>
      </div>

      {schema.fields.length === 0 && (
        <p style={{ color: "#666", marginTop: 12 }}>
          No fields yet. Click <b>+ Add Field</b> to start.
        </p>
      )}

      {schema.fields.map((f, i) => (
        <div
          key={f.id}
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid #eee",
            borderRadius: 8,
            background: "#fafafa",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <strong>Field #{i + 1}</strong>
            <button onClick={() => removeField(f.id)}>Remove</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 120px", gap: 8, marginTop: 8 }}>
            <div>
              <label>Label</label>
              <input
                style={{ width: "100%" }}
                value={f.label}
                onChange={(e) => updateField(f.id, { label: e.target.value })}
                placeholder="Full Name"
              />
            </div>
            <div>
              <label>Type</label>
              <select
                style={{ width: "100%" }}
                value={f.type}
                onChange={(e) => updateField(f.id, { type: e.target.value })}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="dropdown">Dropdown</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 18 }}>
              <input
                type="checkbox"
                checked={!!f.required}
                onChange={(e) => updateField(f.id, { required: e.target.checked })}
                id={`req-${f.id}`}
              />
              <label htmlFor={`req-${f.id}`}>Required</label>
            </div>
          </div>

          {f.type === "number" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 8 }}>
              <div>
                <label>Min</label>
                <input
                  type="number"
                  value={f.min ?? ""}
                  onChange={(e) =>
                    updateField(f.id, {
                      min: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label>Max</label>
                <input
                  type="number"
                  value={f.max ?? ""}
                  onChange={(e) =>
                    updateField(f.id, {
                      max: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label>Step</label>
                <input
                  type="number"
                  value={f.step ?? ""}
                  onChange={(e) =>
                    updateField(f.id, {
                      step: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          )}

          {f.type === "dropdown" && (
            <div style={{ marginTop: 8 }}>
              <label>Options (comma separated)</label>
              <input
                style={{ width: "100%" }}
                value={(f.options || []).join(",")}
                onChange={(e) =>
                  updateField(f.id, {
                    options: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Admin, User, Guest"
              />
            </div>
          )}

          <div style={{ marginTop: 8 }}>
            <label>Field ID (auto)</label>
            <input readOnly value={f.id} style={{ width: "100%" }} />
          </div>
        </div>
      ))}

      <h3 style={{ marginTop: 20 }}>Live Form</h3>
      <form onSubmit={handleSubmit}>
        {schema.fields.map((f) => (
          <div key={f.id} style={{ marginBottom: 10 }}>
            <label>
              {f.label || f.id} {f.required ? "*" : ""}
            </label>
            <div>
              {f.type === "text" && (
                <input type="text" onChange={(e) => setVal(f.id, e.target.value)} />
              )}
              {f.type === "number" && (
                <input
                  type="number"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  onChange={(e) =>
                    setVal(f.id, e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              )}
              {f.type === "date" && (
                <input type="date" onChange={(e) => setVal(f.id, e.target.value)} />
              )}
              {f.type === "dropdown" && (
                <select defaultValue="" onChange={(e) => setVal(f.id, e.target.value)}>
                  <option value="" disabled>
                    Select...
                  </option>
                  {(f.options || []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ))}

        <button type="submit">Submit</button>
        <button
          type="button"
          onClick={() => {
            const reset = {};
            for (const f of schema.fields) reset[f.id] = "";
            setValues(reset);
            setSubmitted(null);
          }}
          style={{ marginLeft: 8 }}
        >
          Reset
        </button>
      </form>

      {submitted && (
        <>
          <h4>Submitted JSON</h4>
          <pre>{JSON.stringify(submitted, null, 2)}</pre>
        </>
      )}

      <h4 style={{ marginTop: 16 }}>Sample Firebase JSON (for import)</h4>
      <pre>{JSON.stringify(
        {
          title: "Imported Form Example",
          fields: [
            { id: "name", label: "Full Name", type: "text", required: true },
            { id: "age", label: "Age", type: "number", min: 0, max: 120 },
            { id: "dob", label: "DOB", type: "date" },
            { id: "role", label: "Role", type: "dropdown", options: ["Admin","User","Guest"], required: true }
          ]
        },
        null,
        2
      )}</pre>
    </div>
  );
}
