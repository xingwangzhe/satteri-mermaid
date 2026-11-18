import { diagrams } from "./diagrams";
import c4 from "./merman/c4_medium.mmd?raw";
import cynefin from "./merman/cynefin_medium.mmd?raw";
import eventmodeling from "./merman/eventmodeling_medium.mmd?raw";
import info from "./merman/info_medium.mmd?raw";
import ishikawa from "./merman/ishikawa_medium.mmd?raw";
import kanban from "./merman/kanban_medium.mmd?raw";
import radar from "./merman/radar_medium.mmd?raw";
import railroad from "./merman/railroad_medium.mmd?raw";
import railroadAbnf from "./merman/railroad_abnf_medium.mmd?raw";
import railroadEbnf from "./merman/railroad_ebnf_medium.mmd?raw";
import railroadPeg from "./merman/railroad_peg_medium.mmd?raw";
import swimlane from "./merman/swimlane_medium.mmd?raw";
import treeView from "./merman/treeview_medium.mmd?raw";
import treemap from "./merman/treemap_medium.mmd?raw";
import venn from "./merman/venn_medium.mmd?raw";
import wardley from "./merman/wardley_medium.mmd?raw";
import zenuml from "./merman/zenuml_medium.mmd?raw";

/** Coverage corpus for every diagram family exposed by Merman 0.10.0. */
export const mermanDiagrams: Record<string, string> = {
  architecture: diagrams.architecture,
  agentflow: "agentflow-beta\nA --> B",
  block: diagrams.block,
  c4,
  class: diagrams.class,
  cynefin,
  er: diagrams.er,
  eventmodeling,
  flowchart: diagrams.flowchart,
  gantt: diagrams.gantt,
  gitgraph: diagrams.gitgraph,
  info,
  ishikawa,
  journey: diagrams.journey,
  kanban,
  mindmap: diagrams.mindmap,
  packet: diagrams.packet,
  pie: diagrams.pie,
  quadrantchart: diagrams.quadrantchart,
  radar,
  railroad,
  railroadAbnf,
  railroadEbnf,
  railroadPeg,
  requirement: diagrams.requirement,
  sankey: diagrams.sankey,
  sequence: diagrams.sequence,
  state: diagrams.state,
  swimlane,
  timeline: diagrams.timeline,
  treeView,
  treemap,
  usecase: 'usecase-beta\nactor Customer\nCheckout("Place order")\nCustomer --> Checkout',
  venn,
  wardley,
  xychart: diagrams.xychart,
  zenuml,
};
