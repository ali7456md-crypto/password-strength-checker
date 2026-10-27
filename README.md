# Password Strength Checker

A small, privacy-friendly web app that rates password strength in real time.
Built with plain HTML, CSS and JavaScript (no frameworks, no dependencies).

**Live demo:** https://ali7456md-crypto.github.io/password-strength-checker/

## Features
- Live strength meter (5 levels) and checklist of requirements
- Entropy estimate (length × log2 of character pool) with penalties for repeats and sequences
- Estimated time to crack, assuming 10 billion guesses per second
- Detects common passwords, including simple substitutions like `p@ssw0rd`
- 100% client-side: the password never leaves the browser
- Accessible (labels, keyboard focus, live-region updates) and responsive, with dark mode

## Run locally
Open `index.html` in a browser. No build step needed.

## What I learned
- DOM manipulation and event handling in vanilla JavaScript
- Basic information theory (entropy) applied to security
- Git, GitHub and deploying a static site with GitHub Pages
- Accessibility and responsive design

## Possible improvements
- Check against a larger breached-password list
- Add a random passphrase generator
- Unit tests for the scoring functions
