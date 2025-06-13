import { LoadingIndicator } from "./LoadingIndicator";

interface ReportFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputText: string;
  loading: boolean;
}

export default function ReportForm({
  loading,
  onSubmit,
  onInputChange,
  inputText,
}: ReportFormProps) {
  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <>
      <h1>📝 Report Input Guidelines:</h1>
      <p>
        To generate an accurate and insightful report, please describe the
        scenario with as much relevant detail as possible. The model will
        extract and evaluate the following key inputs from your text:
      </p>
      <ul>
        <li>Location (e.g. city, region, coastal area)</li>
        <li>Projected Year for climate impact analysis (defaults to 2055)</li>
        <li>Climate Scenario Severity (e.g. low, medium, or high)</li>
        <li>Foundation Type (e.g. slab-on-grade, crawlspace)</li>
        <li>Architectural Mitigation Features (e.g. elevation, flood vents)</li>
        <li>Structural Materials (e.g. wood, concrete, steel)</li>
      </ul>

      <form onSubmit={onSubmit}>
        <label htmlFor="report-input">
          Enter report details.
          <input
            type="text"
            id="report-input"
            name="report"
            placeholder="Type your content..."
            value={inputText}
            onChange={onInputChange}
            required
          />
        </label>
        <button type="submit">Generate Report</button>
      </form>
    </>
  );
}
