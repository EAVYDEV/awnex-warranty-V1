import { createQBHandler } from "../../lib/qbProxy.js";

export default createQBHandler({
  tableEnv:  "QB_TABLE_ID",
  reportEnv: "QB_REPORT_ID",
  label:     "warranty",
});
