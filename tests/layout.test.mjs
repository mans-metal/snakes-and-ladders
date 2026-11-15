// Layout and data checks for index.html. Run: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const DATA = JSON.parse(html.match(/\/\*DATA\*\/([\s\S]*?)\/\*END\*\//)[1]);
const block = html.slice(html.indexOf("// ---- layout"), html.indexOf("// ---- end layout"));
const { bestLayout } = new Function(block + "; return { bestLayout };")();

test("the example fits: nothing dropped, ladders go up, snakes go down, no shared squares", () => {
  const { N, items, dropped } = bestLayout(DATA);
  assert.equal(dropped.length, 0);
  assert.equal(items.length, DATA.ladders.length + DATA.snakes.length);
  for (const it of items) assert.ok(it.type === "L" ? it.to > it.from : it.to < it.from, it.caption);
  const ends = items.flatMap(it => [it.from, it.to]);
  assert.equal(new Set(ends).size, ends.length);
  assert.ok(ends.every(n => n > 1 && n < N));
});

test("same data and seed give the same board", () => {
  const pos = l => l.items.map(it => [it.from, it.to]);
  assert.deepEqual(pos(bestLayout(DATA)), pos(bestLayout(DATA)));
});

test("every item's persona is a personality or Everyone", () => {
  const names = new Set([...DATA.players.map(p => p.name), "Everyone"]);
  for (const it of [...DATA.ladders, ...DATA.snakes]) assert.ok(names.has(it.persona), it.caption);
  assert.ok(DATA.players.length >= 1 && DATA.players.length <= 4);
});
