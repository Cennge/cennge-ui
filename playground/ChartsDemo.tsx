import type { ReactNode } from "react";
import { Card, CardBody, CardHeader } from "cennge-ui";
import { AreaChart, BarChart, DonutChart, LineChart, Sparkline, type ChartLabels } from "cennge-ui/charts";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-large bg-surface-2 p-6 shadow-raised">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

const labels: Partial<ChartLabels> = { keyboardHint: "Стрелки переключают значения.", empty: "Нет данных" };

const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const downloads = months.map((month, i) => ({
  month,
  cennge: [320, 410, 380, 520, 610, 580, 720, 840, 790, 960, 1120, 1280][i]!,
  payload: [210, 230, 260, 240, 300, 340, 310, 360, 420, 410, 450, 520][i]!,
}));

const issues = [
  { repo: "spredo-crypto-screener", open: 14, closed: 52 },
  { repo: "playwright-msi-scraper", open: 9, closed: 31 },
  { repo: "ai-niche-scout", open: 21, closed: 18 },
  { repo: "payload-cache", open: 4, closed: 27 },
  { repo: "cennge-ui", open: 6, closed: 44 },
];

// Звёзды за 12 недель: у каждого репозитория свой темп.
const stars = Array.from({ length: 12 }, (_, i) => ({
  week: `нед. ${i + 1}`,
  cennge: Math.round(40 + i * i * 2.6 + i * 6),
  spredo: Math.round(120 + i * 9),
  scout: Math.round(60 + 30 * Math.log1p(i)),
}));

const ci = [
  { week: "1", passed: 42, flaky: 3, failed: 6 },
  { week: "2", passed: 51, flaky: 5, failed: 4 },
  { week: "3", passed: 47, flaky: 2, failed: 9 },
  { week: "4", passed: 58, flaky: 4, failed: 3 },
  { week: "5", passed: 63, flaky: 1, failed: 5 },
  { week: "6", passed: 66, flaky: 2, failed: 2 },
];

const languages = [
  { language: "TypeScript", bytes: 412_000 },
  { language: "Python", bytes: 139_000 },
  { language: "Rust", bytes: 61_000 },
  { language: "Shell", bytes: 33_000 },
  { language: "Другие", bytes: 19_000 },
];

// Показатели с трендом за 12 недель. Вниз у задач — это хорошо, поэтому тоже зелёным.
const kpis = [
  {
    title: "Скачивания cennge-ui",
    value: "1 280",
    change: "↑ 14 % за неделю",
    trend: [320, 410, 380, 520, 610, 580, 720, 840, 790, 960, 1120, 1280],
    label: "Скачивания cennge-ui за 12 недель: рост вчетверо",
  },
  {
    title: "Звёзды spredo-crypto-screener",
    value: "219",
    change: "↑ 9 за неделю",
    trend: [120, 129, 138, 147, 156, 165, 174, 183, 192, 201, 210, 219],
    label: "Звёзды spredo-crypto-screener за 12 недель: ровный рост",
  },
  {
    title: "Открытые задачи ai-niche-scout",
    value: "21",
    change: "↓ 3 за неделю",
    trend: [34, 31, 33, 30, 29, 27, 28, 26, 25, 24, 24, 21],
    label: "Открытые задачи ai-niche-scout за 12 недель: снижаются",
  },
];

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="font-semibold">{title}</CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}

export function ChartsDemo() {
  return (
    <Section title="Charts">
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardBody className="flex-row items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-muted">{kpi.title}</p>
                <p className="text-2xl font-semibold">{kpi.value}</p>
                <p className="text-xs text-success-text">{kpi.change}</p>
              </div>
              <Sparkline aria-label={kpi.label} data={kpi.trend} variant="area" className="h-10 w-28" />
            </CardBody>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Скачивания с npm">
          <BarChart
            aria-label="Скачивания с npm по месяцам"
            data={downloads}
            index="month"
            indexLabel="Месяц"
            series={[
              { key: "cennge", label: "cennge-ui" },
              { key: "payload", label: "payload-cache" },
            ]}
            labels={labels}
          />
        </ChartCard>
        <ChartCard title="Задачи по репозиториям">
          <BarChart
            aria-label="Задачи по репозиториям"
            data={issues}
            index="repo"
            indexLabel="Репозиторий"
            layout="horizontal"
            isStacked
            series={[
              { key: "closed", label: "Закрытые" },
              { key: "open", label: "Открытые" },
            ]}
            labels={labels}
          />
        </ChartCard>
        <ChartCard title="Звёзды на GitHub">
          <LineChart
            aria-label="Звёзды на GitHub по неделям"
            data={stars}
            index="week"
            indexLabel="Неделя"
            curve="smooth"
            series={[
              { key: "cennge", label: "cennge-ui" },
              { key: "spredo", label: "spredo-crypto-screener" },
              { key: "scout", label: "ai-niche-scout" },
            ]}
            labels={labels}
          />
        </ChartCard>
        <ChartCard title="Прогоны CI: playwright-msi-scraper">
          {/* Цвет здесь значит состояние, поэтому цвета статусов, а не палитры. */}
          <AreaChart
            aria-label="Прогоны CI playwright-msi-scraper по неделям"
            data={ci}
            index="week"
            indexLabel="Неделя"
            indexFormat={(week) => `нед. ${week}`}
            isStacked
            curve="smooth"
            series={[
              { key: "passed", label: "Успешные", color: "success" },
              { key: "flaky", label: "Нестабильные", color: "warning" },
              { key: "failed", label: "Упавшие", color: "danger" },
            ]}
            labels={labels}
          />
        </ChartCard>
        <ChartCard title="Языки в spredo-crypto-screener">
          <DonutChart
            aria-label="Языки в spredo-crypto-screener"
            data={languages}
            index="language"
            value="bytes"
            indexLabel="Язык"
            valueLabel="Байт"
            // Хвост в «Другие», серым: девятого цвета не бывает.
            colors={[undefined, undefined, undefined, undefined, "default"]}
            labels={{ ...labels, total: "Всего байт", share: "Доля" }}
          />
        </ChartCard>
      </div>
    </Section>
  );
}
