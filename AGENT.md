# Agent Guidelines

## Key Commands

| Command             | Description              |
| ------------------- | ------------------------ |
| `pnpm dev`          | Start development server |
| `pnpm build`        | Production build         |
| `pnpm lint`         | Run ESLint               |
| `pnpm format`       | Prettier write           |
| `pnpm format:check` | Prettier check           |

There is no `test` script.

## Git / Version Control

**Never commit changes automatically.** Always wait for explicit user confirmation before creating a commit.

## Protected Files

### `components/ui/`

All files are shadcn-generated. Never edit them by hand. Use the CLI to add or update components and allow it to overwrite:

```bash
pnpm dlx shadcn@latest add <component>
```

Wrap components outside `components/ui/` when you need custom behavior.

### `lib/utils.ts`

Contains the shadcn-provided `cn()` helper. Do not modify or recreate it manually.

## Radix Usage

Never import from `radix-ui` directly. Use the shadcn components exposed from `components/ui/` instead.

## Styling

Use Tailwind utilities that correspond to the design tokens defined in `app/globals.css` (e.g. `bg-primary`, `text-muted-foreground`). 

Do not edit the `app/globals.css`, rely only on already defined design tokens.

Never rely on arbitrary values such as:

- `bg-[#ff0000]`
- `text-[oklch(0.5_0.2_180)]`
- Inline `style={{ backgroundColor: "#1a1a1a" }}`
