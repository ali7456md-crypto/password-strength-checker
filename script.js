// Password Strength Checker: all logic runs locally in the browser.

const COMMON = new Set([
  "password","password1","password123","123456","1234567","12345678","123456789","1234567890",
  "qwerty","qwerty123","qwertyuiop","abc123","letmein","welcome","admin","iloveyou","monkey",
  "dragon","football","baseball","master","sunshine","princess","login","passw0rd","111111",
  "000000","123123","654321","superman","batman","trustno1","starwars","whatever","freedom",
  "shadow","michael","jennifer","hello","charlie","donald","zaq12wsx","1q2w3e4r","qazwsx"
]);

const LEVELS = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];
const GUESSES_PER_SECOND = 1e10;

const $ = (id) => document.getElementById(id);
const input = $("pw");

function poolSize(pw) {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
  return pool;
}

function hasRepeat(pw) {
  return /(.)\1{2,}/.test(pw);
}

function hasSequence(pw) {
  const s = pw.toLowerCase();
  for (let i = 0; i < s.length - 2; i++) {
    const a = s.charCodeAt(i), b = s.charCodeAt(i + 1), c = s.charCodeAt(i + 2);
    if ((b - a === 1 && c - b === 1) || (a - b === 1 && b - c === 1)) return true;
  }
  return false;
}

function isCommon(pw) {
  const lower = pw.toLowerCase();
  // Also catch simple tricks like "p@ssw0rd" by undoing common substitutions.
  const undone = lower.replace(/@/g, "a").replace(/0/g, "o").replace(/1/g, "i")
                      .replace(/3/g, "e").replace(/\$/g, "s").replace(/5/g, "s");
  return COMMON.has(lower) || COMMON.has(undone);
}

function formatTime(seconds) {
  if (seconds < 1) return "instantly";
  const units = [["year", 31557600], ["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1]];
  if (seconds > 31557600 * 1e9) return "billions of years+";
  for (const [name, size] of units) {
    if (seconds >= size) {
      const n = Math.floor(seconds / size);
      return n.toLocaleString("en-GB") + " " + name + (n === 1 ? "" : "s");
    }
  }
  return "instantly";
}

function analyse(pw) {
  const checks = {
    length: pw.length >= 12,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
    common: pw.length > 0 && !isCommon(pw),
    pattern: pw.length > 0 && !hasRepeat(pw) && !hasSequence(pw),
  };

  // Entropy = length * log2(pool size). Penalise predictable patterns.
  let entropy = pw.length ? pw.length * Math.log2(poolSize(pw)) : 0;
  if (hasRepeat(pw)) entropy *= 0.8;
  if (hasSequence(pw)) entropy *= 0.8;
  if (isCommon(pw)) entropy = Math.min(entropy, 10);

  const seconds = Math.pow(2, entropy) / 2 / GUESSES_PER_SECOND; // average case
  let level = 0;
  if (entropy >= 80) level = 4;
  else if (entropy >= 60) level = 3;
  else if (entropy >= 40) level = 2;
  else if (entropy >= 28) level = 1;

  return { checks, entropy, seconds, level };
}

function tipFor(pw, r) {
  if (!pw) return "";
  if (!r.checks.common) return "This is a very common password. Attackers try these first.";
  if (!r.checks.length) return "Longer is better. Try a passphrase of 4 or more random words.";
  if (!r.checks.pattern) return "Avoid repeated characters and sequences like 1234 or abc.";
  if (r.level >= 3) return "Nice. Use a different password for every account and store them in a password manager.";
  return "Add more length or mix in different character types.";
}

function render() {
  const pw = input.value;
  const r = analyse(pw);

  $("meter").dataset.level = pw ? r.level : "";
  $("verdict").textContent = pw ? "Strength: " + LEVELS[r.level] : "Start typing to see the result.";
  $("s-length").textContent = pw.length;
  $("s-entropy").textContent = Math.round(r.entropy) + " bits";
  $("s-time").textContent = pw ? formatTime(r.seconds) : "instantly";
  $("tips").textContent = tipFor(pw, r);

  document.querySelectorAll("#checks li").forEach((li) => {
    li.classList.toggle("pass", r.checks[li.dataset.check]);
  });
}

input.addEventListener("input", render);

$("toggle").addEventListener("click", (e) => {
  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  e.currentTarget.textContent = showing ? "Show" : "Hide";
  e.currentTarget.setAttribute("aria-pressed", String(!showing));
});

render();
