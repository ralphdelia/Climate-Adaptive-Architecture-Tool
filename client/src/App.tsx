import { useState } from "react";

import Header from "./componets/Header";
import ReportForm from "./componets/ReportForm";
import Report from "./componets/Report";
import type { ReportType } from "./types";

function App() {
  const [inputText, setInputText] = useState("");
  const [climateReport, setClimateReport] = useState<ReportType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ input: inputText }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      setClimateReport(data);
    } catch (err) {
      console.error("Failed to generate report", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const clearReport = () => {
    setInputText("");
    setClimateReport(null);
  };

  return (
    <>
      <main className="container">
        <Header />
        <article>
          {climateReport ? (
            <Report climateReport={climateReport} clearReport={clearReport} />
          ) : (
            <ReportForm
              loading={loading}
              inputText={inputText}
              onSubmit={handleSubmit}
              onInputChange={handleInputChange}
            />
          )}
        </article>
      </main>
    </>
  );
}

export default App;
