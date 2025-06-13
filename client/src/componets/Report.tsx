import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import dedent from "dedent";

import type { ReportType } from "../types";
interface ReportPropsType {
  climateReport: ReportType;
  clearReport: () => void;
}

export default function Report({
  climateReport,
  clearReport,
}: ReportPropsType) {
  console.log(climateReport);
  return (
    <>
      <div>
        <button onClick={clearReport}>{`New Report`}</button>
      </div>
      <br />
      <h2>Extracted Context:</h2>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {dedent(climateReport.context)}
      </ReactMarkdown>
      <h2>Report:</h2>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {dedent(climateReport.report)}
      </ReactMarkdown>
    </>
  );
}
