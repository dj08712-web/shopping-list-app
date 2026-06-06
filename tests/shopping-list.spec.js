const { test, expect } = require("@playwright/test");
const path = require("path");

// 로컬 HTML 파일을 file:// URL로 로드
const APP_URL = "file://" + path.resolve(__dirname, "..", "index.html").replace(/\\/g, "/");

test.beforeEach(async ({ page }) => {
  await page.goto(APP_URL);
  // 각 테스트가 깨끗한 상태에서 시작하도록 localStorage 초기화 후 새로고침
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("초기 상태: 빈 목록 안내와 0개 항목 표시", async ({ page }) => {
  await expect(page.locator(".empty")).toHaveText(/아직 항목이 없습니다/);
  await expect(page.locator("#status")).toHaveText("0개 항목 · 0개 남음");
  await expect(page.locator("#list li")).toHaveCount(0);
});

test("아이템 추가: 버튼 클릭으로 추가된다", async ({ page }) => {
  await page.fill("#itemInput", "우유");
  await page.click("#addBtn");

  await expect(page.locator("#list li")).toHaveCount(1);
  await expect(page.locator("#list li .name")).toHaveText("우유");
  await expect(page.locator("#status")).toHaveText("1개 항목 · 1개 남음");
  // 입력창이 비워지는지 확인
  await expect(page.locator("#itemInput")).toHaveValue("");
});

test("아이템 추가: Enter 키로도 추가되고 여러 개 누적된다", async ({ page }) => {
  await page.fill("#itemInput", "계란");
  await page.press("#itemInput", "Enter");
  await page.fill("#itemInput", "빵");
  await page.press("#itemInput", "Enter");

  await expect(page.locator("#list li")).toHaveCount(2);
  await expect(page.locator("#list li .name").nth(0)).toHaveText("계란");
  await expect(page.locator("#list li .name").nth(1)).toHaveText("빵");
  await expect(page.locator("#status")).toHaveText("2개 항목 · 2개 남음");
});

test("빈 값/공백은 추가되지 않는다", async ({ page }) => {
  await page.click("#addBtn");
  await page.fill("#itemInput", "   ");
  await page.click("#addBtn");

  await expect(page.locator("#list li")).toHaveCount(0);
  await expect(page.locator(".empty")).toBeVisible();
});

test("체크 기능: 클릭하면 완료 처리되고 다시 클릭하면 해제된다", async ({ page }) => {
  await page.fill("#itemInput", "사과");
  await page.click("#addBtn");

  const li = page.locator("#list li").first();
  await expect(li).not.toHaveClass(/done/);

  // 체크 토글 → 완료
  await li.locator(".check").click();
  await expect(li).toHaveClass(/done/);
  await expect(page.locator("#status")).toHaveText("1개 항목 · 0개 남음");

  // 줄긋기(line-through) 스타일 적용 확인
  const decoration = await li.locator(".name").evaluate(
    (el) => getComputedStyle(el).textDecorationLine
  );
  expect(decoration).toContain("line-through");

  // 다시 클릭 → 완료 해제
  await li.locator(".check").click();
  await expect(li).not.toHaveClass(/done/);
  await expect(page.locator("#status")).toHaveText("1개 항목 · 1개 남음");
});

test("체크 기능: 이름을 클릭해도 토글된다", async ({ page }) => {
  await page.fill("#itemInput", "바나나");
  await page.click("#addBtn");

  const li = page.locator("#list li").first();
  await li.locator(".name").click();
  await expect(li).toHaveClass(/done/);
});

test("삭제 기능: ✕ 버튼으로 해당 항목만 삭제된다", async ({ page }) => {
  for (const name of ["양파", "마늘", "당근"]) {
    await page.fill("#itemInput", name);
    await page.click("#addBtn");
  }
  await expect(page.locator("#list li")).toHaveCount(3);

  // 가운데 항목(마늘) 삭제
  await page.locator("#list li", { hasText: "마늘" }).locator(".delete").click();

  await expect(page.locator("#list li")).toHaveCount(2);
  await expect(page.locator("#list li .name").nth(0)).toHaveText("양파");
  await expect(page.locator("#list li .name").nth(1)).toHaveText("당근");
  await expect(page.locator("#status")).toHaveText("2개 항목 · 2개 남음");
});

test("완료 항목 비우기: 체크된 항목만 일괄 삭제된다", async ({ page }) => {
  for (const name of ["콜라", "사이다", "주스"]) {
    await page.fill("#itemInput", name);
    await page.click("#addBtn");
  }
  // 콜라, 주스 체크
  await page.locator("#list li", { hasText: "콜라" }).locator(".check").click();
  await page.locator("#list li", { hasText: "주스" }).locator(".check").click();

  await page.click("#clearDone");

  await expect(page.locator("#list li")).toHaveCount(1);
  await expect(page.locator("#list li .name")).toHaveText("사이다");
});

test("영속성: 새로고침 후에도 항목과 완료 상태가 유지된다", async ({ page }) => {
  await page.fill("#itemInput", "치즈");
  await page.click("#addBtn");
  await page.fill("#itemInput", "버터");
  await page.click("#addBtn");
  // 치즈 완료 처리
  await page.locator("#list li", { hasText: "치즈" }).locator(".check").click();

  await page.reload();

  await expect(page.locator("#list li")).toHaveCount(2);
  await expect(page.locator("#list li", { hasText: "치즈" })).toHaveClass(/done/);
  await expect(page.locator("#list li", { hasText: "버터" })).not.toHaveClass(/done/);
  await expect(page.locator("#status")).toHaveText("2개 항목 · 1개 남음");
});
