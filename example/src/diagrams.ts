/** Small, deterministic examples spanning different parser/layout families. */
export const diagrams: Record<string, string> = {
  flowchart: 'flowchart TD\n A["Start"] --> B["Done"]',
  sequence:
    "sequenceDiagram\n participant Alice\n participant Bob\n Alice->>Bob: Hello\n Note over Bob: Read\n activate Bob\n Bob-->>Alice: Done\n deactivate Bob",
  class: "classDiagram\n class Account {\n +String name\n +save()\n }",
  state: "stateDiagram-v2\n [*] --> Ready\n Ready --> Done\n Done --> [*]",
  er: "erDiagram\n CUSTOMER ||--o{ ORDER : places",
  gantt: "gantt\n dateFormat YYYY-MM-DD\n title Plan\n section Work\n Build :2026-01-01, 3d",
  pie: 'pie title Shares\n "Alpha": 30\n "Beta": 70',
  gitgraph:
    "gitGraph\n commit\n branch develop\n checkout develop\n commit\n checkout main\n merge develop",
  mindmap: "mindmap\n root((Plan))\n  Alpha\n  Beta",
  timeline: "timeline\n title History\n 2024 : Alpha\n 2025 : Beta",
  journey: "journey\n title Trip\n section Morning\n Coffee: 5: Alice\n Work: 3: Alice",
  requirement:
    "requirementDiagram\n requirement test {\n id: 1\n text: Must work\n risk: low\n verifymethod: test\n }",
  sankey: "sankey-beta\nSource,Target,10",
  quadrantchart:
    "quadrantChart\n title Priorities\n x-axis Low --> High\n y-axis Low --> High\n Alpha: [0.3, 0.6]",
  block: 'block-beta\n columns 2\n A["Start"] B["Done"]\n A --> B',
  packet: 'packet-beta\n 0-7: "Header"\n 8-15: "Data"',
  architecture:
    "architecture-beta\n service api(server)[API]\n service db(database)[Database]\n api:R -- L:db",
  xychart: 'xychart-beta\n x-axis [Jan, Feb, Mar]\n y-axis "Count" 0 --> 10\n bar [2, 5, 8]',
};
