# cennge-ui — решения

Зафиксировано 2026-10-18 по итогам интервью и анализа конкурентов.

## Позиционирование
Эстетика уровня Modrinth/Linear, обновления как у Mantine: обычный npm-пакет, `npm update` — и баг
исправлен во всех проектах. Доказательство качества — e2e-матрица оверлеев.

## Пакет
- `cennge-ui`, без scope, MIT. Один вход + `cennge-ui/styles.css`.
- `"type": "module"`, `"sideEffects": ["*.css"]`, `exports` с types/import/require. Сборка tsup (ESM + CJS + .d.ts),
  `"use client"` в выходных файлах.
- peer: `react`, `react-dom` — 18 и 19 в приоритете, 17 поддерживается. `tailwindcss` v4 — peer.
- deps: `radix-ui` (единый пакет), `tailwind-variants`, `tailwind-merge`, `clsx`. Никакого framer-motion.
- Типы Radix не выходят в публичный API — фундамент можно заменить (Base UI) без breaking changes.
- Ради React 17: без прямых `useId`, `useTransition`, `useSyncExternalStore` и API React 19; `forwardRef`.

## Подключение у пользователя
```css
@import "tailwindcss";
@import "cennge-ui/styles.css";
@source "../node_modules/cennge-ui";
```

## Визуальный стиль (ориентир — Modrinth, без заимствования кода: у них GPL-3.0)
- **Тёмная тема первой**, светлая полноценная. Переключение — class `dark` на `<html>` (совместимо с next-themes).
- **Глубина слоями поверхности**: `--cennge-surface-1…4` (фон → карточка → поднятый элемент → кнопка),
  тени вторичны.
- **Тактильность**: внутренний блик снизу у solid, слоистые тени, нажатие `scale(0.97)`,
  свечение в цвет акцента у варианта `shadow`.
- **Фирменный акцент — оранжевый** (`primary`). Полностью заменяем: пользователь переопределяет
  `--cennge-primary-*` (или включает пресет — см. ниже) и получает синий/зелёный/любой.
- Три уровня каждого цвета: насыщенный, `-highlight` (~25%), `-bg` (~10%) — основа flat/faded.
- Крупные радиусы, средняя плотность: radius md ≈ 12px, карточки 16px, кнопка md = 40px. Шрифт Inter (опционально,
  через переменную `--cennge-font-sans`).
- Анимации: свои keyframes, только transform/opacity, `prefers-reduced-motion`.

## Темизация (CSS-first, модель HeroUI)
- Префикс переменных `--cennge-*`, маппинг в Tailwind через `@theme` → `bg-primary`, `text-primary-foreground`…
- Цвета: `default, primary, secondary, success, warning, danger, info`. Каждый: шкала 50–900, `DEFAULT`, `foreground`.
- Layout-токены: радиусы sm/md/lg, толщина границ, disabled-opacity.
- Пресеты акцента в styles.css: `data-accent="blue|green|purple|…"` — переопределяют только `primary`.
- Генератор шкалы из одного цвета — позже (CLI или страница docs).

## API компонентов
- `color` (7), `variant` (7, как HeroUI: solid, bordered, light, flat, faded, shadow, ghost),
  `size` (sm/md/lg), `radius` (none/sm/md/lg/full), `isDisabled`, `isLoading` (+ нативный `disabled`).
- Переопределение: `className` + `classNames={{ slot }}` (slots из tailwind-variants, слияние tailwind-merge).
- Dialog, Dropdown, Card — составные части (`DialogContent`, `DialogHeader`…) + `classNames`.
- `asChild` вместо полиморфного `as` (лёгкие типы).
- Формы: controlled и uncontrolled везде; у Select будет очистка значения.
- `CenngeProvider` — необязательный: дефолтные size/radius/color, `reducedMotion`, Radix TooltipProvider. Тема — не через Provider.
- Старт: Button, Input, Card, Dialog, Dropdown, Badge, Tooltip. Следующий — Combobox/MultiSelect.

## Инфраструктура
- git + GitHub + Actions, pnpm.
- Тесты: Vitest + Testing Library; Playwright (оверлеи, axe, скриншоты 7×7 комбинаций в light/dark).
- CI: typecheck, lint, тесты, publint, arethetypeswrong, матрица React 17/18/19. Публикация changesets с provenance.
- `playground/` на Vite — песочница и стенд для Playwright. Первый реальный проект — Next.js App Router через `npm link`/`pnpm link`.

## Даты, таблицы и клавиатура (2026-10-19)
- Даты и время — ISO-строки без часового пояса: `"2026-10-19"`, `"14:30"`, как у `<input type="date">`. Переживают
  JSON, FormData и server actions; арифметика в UTC, переход на летнее время не сдвигает день.
- Названия месяцев и дней, первый день недели и порядок полей при вводе — из `Intl` по `locale` провайдера.
  Без date-fns и react-day-picker: у shadcn обновление react-day-picker ломало календарь (#4366).
- Год и месяц выбираются сеткой внутри календаря: того же размера, со своей прокруткой и клавиатурой.
  Нативный `<select>` на компьютере раскрывал полтораста лет на всю высоту экрана. Ввод с клавиатуры терпимый:
  `19.10.2026`, `19/10/26`, `19102026`, ISO. Текст, который не дата, остаётся в поле с причиной под ним.
- Где Radix не покрывает виджет (календарь, дерево, ⌘K), клавиатура пишется по паттернам WAI-ARIA APG и
  проверяется e2e во всех движках. Нестабильные примитивы Radix (OTP, поле пароля) спрятаны за нашим API.
- Таблица — нативная разметка, сортировка через `aria-sort`. TanStack Table подключается без адаптеров:
  `TableColumn` принимает `getIsSorted()` и `getToggleSortingHandler()` как есть.
- Диалоги, открытые кодом (из меню, по сочетанию клавиш), возвращают фокус туда, где он был до открытия.
- Фокус с клавиатуры виден у всего, до чего доходит Tab (WCAG 2.4.7): e2e сравнивает, как элемент нарисован с фокусом
  и без, во всех фикстурах и во всём playground. axe этого не видит. В Tailwind v4 `outline-none` обнуляет
  `--tw-outline-style`, поэтому рядом с `focus-visible:outline-2` всегда стоит `focus-visible:outline-solid`.

## Известные риски
- 49 комбинаций color×variant на компонент → только с визуальными тестами.
- React 17 сужает набор API.
- Тактильные тени в dark mode → глубина через surface-слои.
