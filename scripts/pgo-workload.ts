import { createRequire } from "node:module";
import { performance } from "node:perf_hooks";
const native = createRequire(import.meta.url)(process.env.PGO_BINDING_PATH);
const training = process.argv[2] === "train";
const results = {};
let sink = 0;
async function measure(name, fn, iterations = 1) {
  for (let i = 0; i < 2; i++) await fn();
  if (!training) {
    const started = performance.now();
    for (let i = 0; i < iterations; i++) await fn();
    const elapsed = Math.max(performance.now() - started, 0.001);
    iterations = Math.max(iterations, Math.ceil((iterations * 30) / elapsed));
  }
  const samples = [];
  for (let sample = 0; sample < (training ? 2 : 7); sample++) {
    const started = performance.now();
    for (let i = 0; i < iterations; i++) await fn();
    samples.push((performance.now() - started) / iterations);
  }
  results[name] = samples;
}
const diagrams = {
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

diagrams.chineseEr = `erDiagram
  学生 ||--o{ 选课 : 选择
  学生 {
    int 学号 PK
    string 姓名
  }
  选课 {
    int 课程号 PK
  }`;
diagrams.chineseNested = `flowchart TD
 subgraph 团队[中文团队]
   subgraph 子团队[子团队]
     张三[张三] --> 李四[李四]
   end
 end
 李四 --> 王五[王五]`;
diagrams.largeFlowchart =
  "flowchart TD\n" +
  Array.from({ length: training ? 24 : 36 }, (_, i) => `N${i}[节点${i}] --> N${i + 1}`).join("\n");
for (const [name, code] of Object.entries(diagrams)) {
  await measure(
    name,
    () => {
      sink += native.render(code, { diagramId: "pgo-fixture", fastTextMetrics: true }).length;
    },
    name === "largeFlowchart" ? 2 : 12,
  );
  if (training) {
    native.render(code, {
      diagramId: "pgo-dark",
      siteConfigJson: JSON.stringify({
        theme: "dark",
        flowchart: { htmlLabels: false },
        securityLevel: "strict",
      }),
    });
  }
}
if (!Number.isFinite(sink)) throw new Error("Non-finite workload output");
console.log(JSON.stringify(results));
