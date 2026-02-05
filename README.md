🧪 Titration Generator: Interactive Practice Tool

An interactive Single-Page Application (SPA) designed to help chemistry students master titration curve calculations. This tool generates random weak acid/strong base and weak base/strong acid titration curves, hiding the pH axis to challenge students to calculate values manually.

✨ Features
Dual Mode: Supports both Weak Acid/Strong Base and Weak Base/Strong Acid titrations.
Dynamic Randomization: Every time you click "Generate," the app creates a new problem with unique $K_a$/$K_b$ values, volumes, and concentrations.
Interactive Data Points: The curve plots 200 points for a smooth visual, but only 7 strategic points are "interactable" for the quiz.
Visual Scaffolding: * <span style="color:purple">●</span> Purple: Initial pH (Weak Acid/Base dissociation)<span style="color:orange">●</span> Orange: Half-Equivalence Point ($pH = pK_a$)<span style="color:red">●</span> Red: Equivalence Point (Salt Hydrolysis)<span style="color:green">●</span> Green: General Buffer or Excess Titrant regions
Smart Feedback: Provides context-specific hints (e.g., suggesting the Henderson-Hasselbalch equation) based on which region of the curve you click.
Mobile Responsive: Optimized for use on smartphones and tablets in a laboratory or classroom setting.

📚 Pedagogical Goals
This app is designed to move students beyond "plug and chug" formulas by requiring them to:
1. Identify the Region: Determine if they are at the initial point, buffer region, equivalence point, or excess titrant region.
2. Select the Correct Math: Decide between using $K_a$ expressions, the Henderson-Hasselbalch equation, or calculating excess $[OH^-]$ or $[H^+]$.
3. Account for Dilution: Remember to use the total volume ($V_{analyte} + V_{titrant}$) for concentrations at the equivalence point and beyond.

🛠️ Built With
HTML5 / CSS3: Structure and responsive layout.
JavaScript (Vanilla): Custom chemistry engine for pH calculations.
Chart.js: High-performance data visualization.

📄 License
This project is open-source and available under the MIT License. Feel free to use and adapt it for your own classroom!
