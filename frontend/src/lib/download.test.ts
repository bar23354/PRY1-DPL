import { buildTokensExportContent } from "./download";


describe("buildTokensExportContent", () => {
  it("serializes tokens into a tabular export format", () => {
    const content = buildTokensExportContent([
      { type: "IDENT", lexeme: "value", line: 1, column: 1, start: 0, end: 5, ruleIndex: 2 },
      { type: "NUM", lexeme: "12", line: 1, column: 9, start: 8, end: 10, ruleIndex: 3 },
    ]);

    expect(content).toBe(
      "type\tlexeme\tline\tcolumn\tstart\tend\truleIndex\nIDENT\tvalue\t1\t1\t0\t5\t2\nNUM\t12\t1\t9\t8\t10\t3",
    );
  });
});
