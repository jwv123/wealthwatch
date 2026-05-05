"""
# WealthWatch Brand Identity & Assets Guidelines

This document provides the foundational design standards for **WealthWatch: Smart Budget Management System**. These guidelines ensure visual consistency across the dashboard, landing pages, and automated communications.

## 1. Brand Core
WealthWatch focuses on **Security**, **Transparency**, and **Financial Growth**. The visual identity balances a "traditional finance" feel (Navy/Shield) with "modern tech" energy (Vibrant Green/Arrow).

---

## 2. Visual Assets

### 2.1 The Logo
The logo consists of the **Insight Shield** and the **WealthWatch Wordmark**.

* **Insight Shield:** A combination of a protective shield, a magnifying glass for analysis, a stack of coins for assets, and an upward arrow for growth.
* **Wordmark:** A clean, geometric sans-serif typeface.

### 2.2 Usage Rules
* **Clear Space:** Maintain a "safe zone" around the logo equal to the height of the 'W' in the wordmark.
* **Minimum Size:** 150px wide for digital; 1.5 inches for print.
* **Backgrounds:** Use the full-color logo on white or light-gray backgrounds. Use the white-knockout version on dark navy backgrounds.

---

## 3. Color Palette

### Primary Colors
| Color | Hex | RGB | Usage |
| :--- | :--- | :--- | :--- |
| **Success Green** | `#2ECC71` | (46, 204, 113) | Growth arrows, "Inflow" indicators, CTAs |
| **Trust Navy** | `#0B3954` | (11, 57, 84) | Primary logo, headings, navigation bars |
| **Analysis Blue** | `#2A5C82` | (42, 92, 130) | Secondary icons, active states, buttons |

### Neutral Palette
| Color | Hex | Usage |
| :--- | :--- | :--- |
| **Rich Slate** | `#555555` | Body text, sub-headers |
| **Off-White** | `#F8F9FA` | Page backgrounds, card fills |
| **Border Silver** | `#E1E4E8` | Table borders, dividers, input fields |

---

## 4. Typography

### Primary Font: Montserrat (or similar Geometric Sans-Serif)
* **Headings:** Semi-Bold (Navy)
* **Body Copy:** Regular (Slate)
* **Data/Monospace:** JetBrains Mono (For transaction IDs or code-related data)

---

## 5. UI Elements Style

* **Corners:** Use a consistent `4px` or `6px` border-radius for buttons and containers to maintain a modern but structured look.
* **Shadows:** Soft, subtle shadows for cards (`0 4px 6px -1px rgba(0,0,0,0.1)`).
* **Data Visualization:** Use **Success Green** for positive trends and a complementary **Soft Red** (`#E74C3C`) for alerts/over-budget states.

---

## 6. Implementation (CSS / Design Tokens)

For developers using CSS variables or Tailwind:

```css
:root {
  /* Brand Colors */
  --ww-green: #2ecc71;
  --ww-navy: #0b3954;
  --ww-blue: #2a5c82;
  
  /* Backgrounds */
  --ww-bg-page: #f8f9fa;
  --ww-bg-card: #ffffff;
  
  /* Text */
  --ww-text-main: #555555;
  --ww-text-header: #0b3954;
  
  /* Borders */
  --ww-border: #e1e4e8;
}
"""