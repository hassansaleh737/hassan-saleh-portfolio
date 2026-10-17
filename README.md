# Hassan Saleh — Charcoal & Sage — Futuristic 3D AI Portfolio

An editable **responsive, animated AI portfolio website** built from the original `Hassan_Saleh_AI(1).pdf` CV. Includes all seven selected projects/work entries, the FlyRank internship data, verified GitHub repository links, education and certifications. Site copy is in English for an international professional audience.

## Quick start

1. Extract this ZIP archive.
2. Double-click `index.html` to open the site in Chrome, Edge, Safari or Firefox.
3. No Node.js, npm, server, API keys or paid services are required. It works without internet access, although Google Fonts fall back to system fonts offline.

For VS Code live previews, you can optionally install **Live Server**, right-click `index.html` and choose **Open with Live Server**.

## Project files

- `index.html`: Full portfolio content, project cards, links and section order.
- `styles.css`: Calm charcoal and sage green futuristic design, responsiveness, gradients, UI transitions, CSS animations and 3D card tilts.
- `script.js`: Interactive 3D-perspective Canvas neural orb, project filtering, scroll animations, navigation and accessibility handling.
- `assets/Hassan_Saleh_Original_CV.pdf`: Original user-supplied CV used by Download CV links.
- `assets/favicon.svg`: Browser-tab icon.

## Page order

1. Hero / introduction (interactive 3D neural core)
2. About / personal background
3. Expertise / tech stack
4. Seven selected projects and work samples (filterable)
5. FlyRank internship highlight
6. Education / certifications / languages
7. Contact and social links

## Customization

- Update your heading, biography and contact info in `index.html`.
- Edit individual projects under `<section id="projects">`; change their verified GitHub URLs and concise descriptions.
- For colors, edit the CSS custom properties at the top of `styles.css` (`--mint`, `--sage-light`, `--bg`).
- Replace `assets/Hassan_Saleh_Original_CV.pdf` if you update your résumé later.
- Change the animation speed and 3D orbital colors in `script.js` near `configs`.

## Technical decisions

3D geometry is rendered via **native Canvas perspective projection**, rotating mesh landmarks and independent gyroscope rings. No external Three.js/CDN is required for this effect. The layout also uses **CSS 3D transforms** on interactive cards. The scene is paused when offscreen and `prefers-reduced-motion` is respected. Projects have accessible filter buttons and semantic cards.

## Publishing

Deploy the folder to GitHub Pages, Netlify or Cloudflare Pages. With GitHub Pages, create a repository, push these files to the default branch, then turn on **Settings → Pages → Deploy from branch**. No build step is required.

## Notes

- The FlyRank internship is listed as **ongoing in the supplied CV**; the site does not infer a current status beyond that source.
- The original CV lists 7 selected work entries, including the internship. The site displays them all and highlights the internship in Experience as well.
- Avoid describing projects as deployed live services unless deployment links and evidence are provided.
- External repository and social URLs were extracted from hyperlink annotations in the original PDF, not guessed.

## Color & motion update (Charcoal × Sage Green)

The original neon cyan/violet theme was replaced across the layout, project graphics, and 3D neural core.

- Background `#121417`, surfaces `#1B1F24`, border `#2B3138` / softened green gray.
- Main text `#E8ECE9`, secondary text `#A8B3AC`.
- Accent `#8FAF9A`, hover `#A8C3B0`.
- Cursor position drives a **delayed soft sage spotlight** with a very slight neutral/stone hue shift.
- Project/expertise cards have low-intensity pointer spotlight and restrained 3D tilt.
- Mobile and `prefers-reduced-motion` disable distracting pointer interactions.

You can change the key palette in `styles.css` under the `:root` variables.
