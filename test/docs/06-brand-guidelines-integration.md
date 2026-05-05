# WealthWatch — Brand Guidelines Integration

## CSS Custom Properties

All brand colors and design tokens are defined as CSS custom properties in `src/styles.scss`. Always reference these variables instead of hardcoding values:

```scss
// Colors
color: var(--ww-navy);         // #0B3954 - headings, navigation
color: var(--ww-green);        // #2ECC71 - income, CTAs, positive states
color: var(--ww-blue);         // #2A5C82 - secondary buttons, active states
color: var(--ww-text-main);   // #555555 - body text
color: var(--ww-red);          // #E74C3C - alerts, over-budget, negative states

// Backgrounds
background-color: var(--ww-bg-page);  // #F8F9FA - page background
background-color: var(--ww-bg-card);  // #FFFFFF - card fills

// Borders
border-color: var(--ww-border);       // #E1E4E8 - table borders, dividers, inputs

// Shadows
box-shadow: var(--ww-shadow);          // 0 4px 6px -1px rgba(0,0,0,0.1)

// Border Radius
border-radius: var(--ww-radius);      // 6px (use 4px for small elements)
```

## Typography

### Font Imports

Fonts are imported in `src/styles.scss` via Google Fonts:

```scss
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=JetBrains+Mono:wght@400;600&display=swap');
```

### Font Usage

| Context | Font | Weight | Color | CSS |
|---------|------|--------|-------|-----|
| Headings | Montserrat | 600 (Semi-Bold) | Navy | `font-family: var(--ww-font-heading); font-weight: 600; color: var(--ww-navy);` |
| Body text | Montserrat | 400 (Regular) | Slate | `font-family: var(--ww-font-body); color: var(--ww-text-main);` |
| Data/Numbers | JetBrains Mono | 400 or 600 | Contextual | `font-family: var(--ww-font-data);` |
| Transaction IDs | JetBrains Mono | 400 | Slate | `font-family: var(--ww-font-data);` |

### Heading Sizes

```scss
h1 { font-size: 2rem; }    // 32px - Page titles
h2 { font-size: 1.5rem; }  // 24px - Section headers
h3 { font-size: 1.25rem; } // 20px - Card headers
```

## Utility Classes

Pre-built utility classes are available in `styles.scss`:

| Class | Purpose |
|-------|---------|
| `.ww-card` | White card with shadow and border-radius |
| `.ww-btn` | Base button styles |
| `.ww-btn-primary` | Blue button (Analysis Blue background) |
| `.ww-btn-success` | Green button (Success Green background) |
| `.ww-btn-danger` | Red button (Alert Red background) |
| `.ww-input` | Form input with border and focus state |
| `.ww-label` | Form label |
| `.ww-text-income` | Green text for income amounts |
| `.ww-text-expense` | Red text for expense amounts |
| `.ww-text-muted` | Muted slate text |

## Data Visualization Colors

| Data Point | Color | Hex |
|-----------|-------|-----|
| Income / Positive | Success Green | `#2ECC71` |
| Expenses / Negative | Alert Red | `#E74C3C` |
| Chart gridlines | Border Silver | `#E1E4E8` |

Chart fonts:
- Labels: Montserrat Regular
- Data values: JetBrains Mono

## Card Shadows

```scss
// Standard card shadow
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

// Hover elevation (optional)
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
```

## Border Radius

```scss
// Standard (default)
border-radius: 6px;  // var(--ww-radius)

// Small (tags, badges)
border-radius: 4px;

// Circular (avatar, color dots)
border-radius: 50%;
```

## SVG Icons

Icons should be placed in `src/assets/icons/` and referenced as inline SVGs or via the Angular component pattern. Preferred icons:

- Dashboard: grid icon
- Transactions: dollar-sign icon
- Categories: tag icon
- Income: arrow-up icon
- Expense: arrow-down icon
- Logout: log-out icon

All SVG icons should use `currentColor` for stroke/fill to inherit the parent's text color.

## Logo

The WealthWatch logo is located at `brand-assets/logo.png`. Copy it to `src/assets/images/logo.png` for use in the navbar and login/register pages.

Usage:
```html
<img src="assets/images/logo.png" alt="WealthWatch" class="navbar__logo" />
```

The logo clear-space rule: maintain a safe zone around the logo equal to the height of the "W" in the wordmark. Minimum digital size: 150px wide.