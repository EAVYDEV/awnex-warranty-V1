import { createQBHandler } from "../../lib/qbProxy.js";

export default createQBHandler({
  tableEnv:  "QB_INSPECTIONS_TABLE_ID",
  reportEnv: "QB_INSPECTIONS_REPORT_ID",
  label:     "inspections",
});
