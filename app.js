/* Post-op OPD book
   Records stay in this browser (localStorage).
   Open index.html to use the app. No server is required.
*/

const KEY = "gynonc-postop-opd-v1";

const DIAGNOSES = [
  ["ovarian", "Epithelial ovarian cancer"],
  ["tube", "Fallopian tube cancer"],
  ["peritoneal", "Primary peritoneal cancer"],
  ["borderline", "Borderline ovarian tumour"],
  ["endometrial", "Endometrial carcinoma"],
  ["sarcoma", "Uterine sarcoma"],
  ["cervix", "Cervical cancer"],
  ["vulva", "Vulvar cancer"],
  ["vagina", "Vaginal cancer"],
  ["gtn", "Gestational trophoblastic neoplasia"],
  ["other", "Other"],
];

const SURGERIES = [
  ["pcs", "Primary cytoreductive surgery"],
  ["ics", "Interval cytoreductive surgery"],
  ["scs", "Secondary cytoreductive surgery"],
  ["staging", "Staging laparotomy"],
  ["hyst", "Hysterectomy with BSO"],
  ["rh", "Radical hysterectomy"],
  ["trach", "Radical trachelectomy"],
  ["cone", "Conization / LEEP"],
  ["vulv", "Radical vulvectomy with groin dissection"],
  ["wle", "Wide local excision of vulva"],
  ["groin", "Groin node dissection"],
  ["exent", "Pelvic exenteration"],
  ["other", "Other"],
];

const APPROACHES = [
  ["open", "Open"],
  ["lap", "Laparoscopic"],
  ["robot", "Robotic"],
  ["vaginal", "Vaginal"],
  ["combined", "Combined"],
];

const RESIDUAL = [
  ["r0", "R0 — no gross residual"],
  ["r1", "R1 — residual up to 1 cm"],
  ["r2", "R2 — residual more than 1 cm"],
  ["na", "Not applicable"],
];

const GENERAL = [
  ["comfortable", "Comfortable"],
  ["fair", "Fair"],
  ["unwell", "Unwell"],
];

const WOUND = [
  ["healthy", "Healthy / healing"],
  ["red", "Redness"],
  ["serous", "Serous discharge"],
  ["pus", "Purulent discharge"],
  ["open", "Partial opening"],
  ["healed", "Healed"],
];

const GROIN = [
  ["healthy", "Healthy"],
  ["discharge", "Discharge"],
  ["breakdown", "Wound breakdown"],
  ["lymph", "Lymphorrhoea"],
];

const DRAIN = [
  ["none", "No drain"],
  ["in", "Still in"],
  ["out-today", "Removed today"],
  ["out", "Removed earlier"],
];

const CATHETER = [
  ["none", "No catheter"],
  ["in", "Still in"],
  ["voiding", "Removed — passing urine"],
  ["retention", "Removed — retention or recatheterised"],
];

const BOWEL = [
  ["stool", "Stool passed"],
  ["flatus", "Flatus only"],
  ["constipation", "Constipated"],
  ["loose", "Loose stools"],
  ["none", "No flatus or stool"],
];

const DIET = [
  ["normal", "Normal diet"],
  ["soft", "Soft diet"],
  ["liquids", "Liquids"],
  ["poor", "Poor intake"],
  ["npo", "Nil by mouth"],
];

const MOBILITY = [
  ["independent", "Walking independently"],
  ["help", "Walking with help"],
  ["bed", "Mostly in bed"],
];

const LYMPH = [
  ["none", "None"],
  ["mild", "Mild leg swelling"],
  ["marked", "Marked leg swelling"],
  ["groin", "Groin seroma or lymph leak"],
];

const VTE = [
  ["heparin", "Enoxaparin or heparin ongoing"],
  ["stockings", "Stockings"],
  ["stopped", "Prophylaxis stopped, and explained"],
  ["not-started", "Not started"],
];

const PATHOLOGY = [
  ["pending", "Report not back yet"],
  ["available", "Report is back — not yet discussed"],
  ["discussed", "Report discussed with the patient"],
];

const MDT = [
  ["not-needed", "Not needed"],
  ["planned", "Planned"],
  ["done", "Done"],
];

const ADJUVANT = [
  ["undecided", "Not decided yet"],
  ["observe", "Observation / surveillance"],
  ["chemo", "Chemotherapy"],
  ["rt", "Radiotherapy"],
  ["ccrt", "Chemoradiation"],
  ["hormone", "Hormonal therapy"],
  ["palliative", "Palliative care"],
  ["other", "Other"],
];

const ECOG = [
  ["0", "0 — fully active"],
  ["1", "1 — restricted strenuous activity"],
  ["2", "2 — up more than half the day"],
  ["3", "3 — in bed or chair more than half the day"],
  ["4", "4 — fully bedbound"],
];

const FLAGS = [
  "Fever",
  "Wound opening or pus",
  "Worsening abdominal swelling",
  "Vomiting that is not settling",
  "Unable to pass urine",
  "No flatus or stool, with pain",
  "Heavy vaginal bleeding",
  "Leg swelling or calf pain",
  "Chest pain or breathlessness",
  "Pain not controlled with prescribed medicines",
];

const MED_LINES = [
  "Paracetamol — ",
  "A stomach-acid tablet — ",
  "A laxative — ",
  "Heparin / enoxaparin — ",
  "An antibiotic — ",
  "Iron — ",
  "Other — ",
];

const STANDARD_ADVICE = [
  "Wound care and bathing were discussed.",
  "Walk a few times through the day, and rest when you need to.",
  "Eat and drink as you were advised at discharge.",
  "Take only the medicines that were prescribed.",
  "Come back sooner, or go to emergency, if you have fever, pus or opening of the wound, heavy vaginal bleeding, vomiting that will not stop, inability to pass urine, a painful swollen leg, chest pain, or breathlessness.",
  "The next visit date was given.",
].join("\n");

const BAND_NAME = [
  "Follow-up overdue",
  "Follow-up today",
  "Warning signs on the last visit",
  "Pathology needs attention",
  "No visit recorded yet",
  "Rest of the list",
];

const ui = { query: "", filter: "all" };
let formDirty = false;
let storageOk = true;
let toldStorage = false;
let toastTimer = 0;

let state = blankState();

function blankState() {
  return {
    version: 1,
    patients: [],
    visits: [],
    settings: { clinician: "", welcomeDismissed: false },
  };
}

function uid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blankState();
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.patients) || !Array.isArray(data.visits)) return blankState();
    return {
      version: 1,
      patients: data.patients.filter((p) => p && typeof p.id === "string" && typeof p.name === "string"),
      visits: data.visits.filter((v) => v && typeof v.id === "string" && typeof v.patientId === "string"),
      settings: {
        clinician: (data.settings && data.settings.clinician) || "",
        welcomeDismissed: !!(data.settings && data.settings.welcomeDismissed),
      },
    };
  } catch (err) {
    storageOk = false;
    return blankState();
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    storageOk = true;
  } catch (err) {
    storageOk = false;
    if (!toldStorage) {
      toldStorage = true;
      toast("Could not save on this computer. Notes may disappear when you close the page.");
    }
  }
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function todayISO() {
  const t = new Date();
  const z = (n) => String(n).padStart(2, "0");
  return t.getFullYear() + "-" + z(t.getMonth() + 1) + "-" + z(t.getDate());
}

function shiftISO(iso, days) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  const z = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
}

function formatDate(iso) {
  if (!iso) return "";
  const parts = String(iso).split("-");
  if (parts.length !== 3) return String(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[Number(parts[1]) - 1];
  if (!month) return String(iso);
  return Number(parts[2]) + " " + month + " " + parts[0];
}

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function longToday() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysBetween(from, to) {
  const a = new Date(from + "T00:00:00");
  const b = new Date(to + "T00:00:00");
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return NaN;
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function pod(surgeryDate, onDate) {
  if (!surgeryDate || !onDate) return null;
  return daysBetween(surgeryDate, onDate);
}

function podText(n) {
  if (n === null || Number.isNaN(n)) return "Surgery date is missing, so the day count cannot be shown.";
  if (n === 0) return "Day of surgery";
  if (n > 0) return "Day " + n + " after surgery";
  const days = -n;
  return days + " day" + (days === 1 ? "" : "s") + " before the surgery date";
}

function labelOf(list, value) {
  if (!value) return "";
  const hit = list.find((item) => item[0] === value);
  return hit ? hit[1] : String(value);
}

function diagnosisLabel(p) {
  if (!p) return "";
  if (p.diagnosis === "other") return p.diagnosisOther || "Other";
  return labelOf(DIAGNOSES, p.diagnosis) || p.diagnosis || "Not recorded";
}

function surgeryLabel(p) {
  if (!p) return "";
  if (p.surgery === "other") return p.surgeryOther || "Other";
  return labelOf(SURGERIES, p.surgery) || p.surgery || "Not recorded";
}

function visitsOf(patientId) {
  return state.visits
    .filter((v) => v.patientId === patientId)
    .sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.createdAt || "").localeCompare(a.createdAt || ""));
}

function latestVisit(patientId) {
  return visitsOf(patientId)[0] || null;
}

function findPatient(id) {
  return state.patients.find((p) => p.id === id) || null;
}

function findVisit(id) {
  return state.visits.find((v) => v.id === id) || null;
}

function followStatus(visit) {
  if (!visit || !visit.nextVisit) return "none";
  const today = todayISO();
  if (visit.nextVisit < today) return "overdue";
  if (visit.nextVisit === today) return "today";
  return "upcoming";
}

function band(patient) {
  const visit = latestVisit(patient.id);
  const status = followStatus(visit);
  if (status === "overdue") return 0;
  if (status === "today") return 1;
  if (visit && visit.redFlags && visit.redFlags.length) return 2;
  if (visit && (visit.pathology === "pending" || visit.pathology === "available")) return 3;
  if (!visit) return 4;
  return 5;
}

function rowTone(patient) {
  const visit = latestVisit(patient.id);
  const status = followStatus(visit);
  if (status === "overdue") return "overdue";
  if (visit && visit.redFlags && visit.redFlags.length) return "alert";
  if (status === "today") return "today";
  if (visit && (visit.pathology === "pending" || visit.pathology === "available")) return "path";
  if (!visit) return "new";
  return "ok";
}

function sortPatients(list) {
  return list.slice().sort((a, b) => {
    const diff = band(a) - band(b);
    if (diff) return diff;
    const da = (latestVisit(a.id) || {}).nextVisit || "9999-99-99";
    const db = (latestVisit(b.id) || {}).nextVisit || "9999-99-99";
    if (da !== db) return da.localeCompare(db);
    return String(a.name).localeCompare(String(b.name));
  });
}

function matchesFilter(patient) {
  const visit = latestVisit(patient.id);
  const status = followStatus(visit);
  if (ui.filter === "due") return status === "overdue" || status === "today" || !visit;
  if (ui.filter === "flags") return !!(visit && visit.redFlags && visit.redFlags.length);
  if (ui.filter === "path") return !!(visit && (visit.pathology === "pending" || visit.pathology === "available"));
  return true;
}

function matchesQuery(patient, query) {
  const words = String(query || "").toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const visit = latestVisit(patient.id);
  const hay = [
    patient.name,
    patient.uhid,
    patient.phone,
    diagnosisLabel(patient),
    patient.histology,
    patient.figo,
    surgeryLabel(patient),
    patient.notes,
    visit && visit.planNote,
    visit && visit.medicines,
  ].join(" ").toLowerCase();
  return words.every((word) => hay.includes(word));
}

function option(value, label, current) {
  const selected = String(value) === String(current ?? "") ? " selected" : "";
  return '<option value="' + esc(value) + '"' + selected + ">" + esc(label) + "</option>";
}

function selectBox(name, list, current, placeholder) {
  const known = list.some((item) => item[0] === current);
  const extra = current && !known ? option(current, current, current) : "";
  const head = '<option value=""' + (current ? "" : " selected") + ">" + esc(placeholder || "Not recorded") + "</option>";
  return '<select name="' + esc(name) + '">' + head + extra + list.map((item) => option(item[0], item[1], current)).join("") + "</select>";
}

function field(label, inner, className) {
  const cls = "field" + (className ? " " + className : "");
  const title = '<span class="label">' + label + "</span>";
  if (inner.indexOf("<button") !== -1) return '<div class="' + cls + '">' + title + inner + "</div>";
  return '<div class="' + cls + '"><label>' + title + inner + "</label></div>";
}

function personTitle(patient) {
  return patient.name + (patient.age ? ", " + patient.age + " years" : "");
}

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter((part) => part && part[0] !== "(");
  const a = (parts[0] || "?")[0];
  const b = parts[1] ? parts[1][0] : "";
  return (a + b).toUpperCase();
}

function avatarStyle(name) {
  let hash = 0;
  const text = String(name || "");
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return "background:hsl(" + hue + " 32% 86%);color:hsl(" + hue + " 28% 22%)";
}

function needsGroin(patient) {
  const text = [patient.diagnosis, patient.diagnosisOther, patient.surgery, patient.surgeryOther, diagnosisLabel(patient), surgeryLabel(patient)].join(" ");
  return /vulva|groin/i.test(text);
}

function route() {
  const parts = (location.hash.replace(/^#/, "") || "/").split("/").filter(Boolean).map(decodePart);
  if (parts[0] === "new") return { name: "patient-form" };
  if (parts[0] === "patient" && parts[1]) {
    if (parts[2] === "edit") return { name: "patient-form", id: parts[1] };
    if (parts[2] === "visit") return { name: "visit-form", id: parts[1], visitId: parts[3] && parts[3] !== "new" ? parts[3] : null };
    if (parts[2] === "note" && parts[3]) return { name: "note", id: parts[1], visitId: parts[3] };
    return { name: "patient", id: parts[1] };
  }
  return { name: "list" };
}

function decodePart(value) {
  try { return decodeURIComponent(value); } catch (err) { return value; }
}

function go(hash) {
  formDirty = false;
  if (location.hash === hash || (hash === "#/" && (location.hash === "" || location.hash === "#"))) render();
  else location.hash = hash;
}

function toast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3400);
}

function storageBanner() {
  if (storageOk) return "";
  return '<div class="banner bad">This browser is not storing notes. They will be lost if you close the page.</div>';
}

function foot() {
  return '<p class="foot-note no-print">A clinic notebook for post-operative visits. It does not diagnose, stage, or prescribe. You remain the treating doctor.</p>';
}

function syncNav(current) {
  const adding = current.name === "patient-form" && !current.id;
  document.querySelectorAll("[data-nav]").forEach((el) => {
    const on = el.dataset.nav === "new" ? adding : !adding;
    el.classList.toggle("active", on);
    if (on) el.setAttribute("aria-current", "page");
    else el.removeAttribute("aria-current");
  });
}

function render() {
  formDirty = false;
  const current = route();
  syncNav(current);
  const main = document.getElementById("main");
  try {
    if (current.name === "list") renderList(main);
    else if (current.name === "patient-form") renderPatientForm(main, current.id);
    else if (current.name === "patient") renderPatient(main, current.id);
    else if (current.name === "visit-form") renderVisitForm(main, current.id, current.visitId);
    else if (current.name === "note") renderNote(main, current.id, current.visitId);
    else renderList(main);
  } catch (err) {
    console.error(err);
    main.innerHTML = '<div class="wrap"><div class="banner bad">Something went wrong while opening this page. Your saved patients should still be in this browser. Go back to the <a href="#/">clinic list</a>.</div></div>';
  }
  window.scrollTo(0, 0);
}

function renderList(main) {
  document.title = "Post-op OPD · Gynecologic oncology";
  const counts = countStats();
  const help = state.patients.length && !state.settings.welcomeDismissed ? welcomeCard() : "";
  const body = state.patients.length ? listTools(counts) : emptyState();
  main.innerHTML = '<div class="wrap">' + storageBanner() + pageHeading() + help + body + foot() + "</div>";
  const search = document.getElementById("search");
  if (search) search.value = ui.query;
  paintList();
}

function pageHeading() {
  return '<header class="page-head"><div><h2>Clinic list</h2><p class="lead">' + esc(longToday()) + "</p></div>" +
    '<div class="actions"><a class="btn primary" href="#/new">Add patient</a></div></header>';
}

function welcomeCard() {
  return '<section class="help"><h3>How this book works</h3><ol>' +
    "<li>Add a patient once, with the diagnosis and the operation date.</li>" +
    "<li>At each OPD visit, record the wound, recovery, pathology, and the plan you made.</li>" +
    "<li>Copy or print the note for the case file.</li>" +
    "<li>Download a backup at the end of clinic. Notes stay only in this browser.</li>" +
    '</ol><div class="actions"><button class="btn ghost" type="button" data-action="dismiss-welcome">Hide this</button></div></section>';
}

function emptyState() {
  return '<section class="empty"><h3>No patients yet</h3>' +
    "<p>Add a patient who has had gynecologic cancer surgery. At each OPD visit you can record wound healing, recovery, the pathology report, and your plan.</p>" +
    "<p>A practice patient is fictional, so you can click through the pages before using real names.</p>" +
    '<div class="actions"><a class="btn primary" href="#/new">Add patient</a>' +
    '<button class="btn" type="button" data-action="add-sample">Add a practice patient</button></div></section>';
}

function countStats() {
  const counts = { total: state.patients.length, due: 0, flags: 0, path: 0 };
  state.patients.forEach((patient) => {
    const visit = latestVisit(patient.id);
    const status = followStatus(visit);
    if (status === "overdue" || status === "today") counts.due += 1;
    if (visit && visit.redFlags && visit.redFlags.length) counts.flags += 1;
    if (visit && (visit.pathology === "pending" || visit.pathology === "available")) counts.path += 1;
  });
  return counts;
}

function listTools(counts) {
  const chips = [
    ["all", "All"],
    ["due", "Needs a visit"],
    ["flags", "Warning signs"],
    ["path", "Pathology"],
  ];
  return '<section class="stats">' +
    statCard(counts.total, "Patients", "") +
    statCard(counts.due, "Due for follow-up", counts.due ? "hot" : "") +
    statCard(counts.flags, "Warning signs last visit", counts.flags ? "hot" : "") +
    statCard(counts.path, "Pathology needs attention", counts.path ? "plum" : "") +
    "</section>" +
    '<div class="toolbar"><input id="search" class="search" type="search" placeholder="Search name, UHID, diagnosis, or surgery" aria-label="Search patients" />' +
    '<div class="filters">' + chips.map((chip) => '<button class="chip' + (ui.filter === chip[0] ? " on" : "") + '" type="button" data-action="filter" data-filter="' + chip[0] + '">' + chip[1] + "</button>").join("") + "</div></div>" +
    '<p class="list-count" id="list-count"></p><div id="list"></div>';
}

function statCard(value, label, tone) {
  return '<div class="stat ' + tone + '"><b>' + esc(value) + "</b><span>" + esc(label) + "</span></div>";
}

function paintList() {
  const host = document.getElementById("list");
  if (!host) return;
  const rows = sortPatients(state.patients.filter((patient) => matchesFilter(patient) && matchesQuery(patient, ui.query)));
  const count = document.getElementById("list-count");
  if (count) {
    const narrowed = ui.query.trim() || ui.filter !== "all";
    count.textContent = narrowed ? "Showing " + rows.length + " of " + state.patients.length : rows.length + " patient" + (rows.length === 1 ? "" : "s");
  }
  if (!rows.length) {
    host.innerHTML = '<div class="empty"><h3>No one in this group</h3><p>' +
      (ui.query.trim() ? "No patient matches that search." : "Nobody matches this filter today.") + "</p></div>";
    return;
  }
  let html = "";
  let lastBand = -1;
  rows.forEach((patient) => {
    const group = band(patient);
    if (group !== lastBand) {
      html += '<h3 class="group">' + esc(BAND_NAME[group]) + "</h3>";
      lastBand = group;
    }
    html += patientRow(patient);
  });
  host.innerHTML = html;
}

function patientRow(patient) {
  const visit = latestVisit(patient.id);
  const n = pod(patient.surgeryDate, todayISO());
  const meta = [diagnosisLabel(patient), surgeryLabel(patient), n !== null && !Number.isNaN(n) && n >= 0 ? podText(n) : ""].filter(Boolean).join(" · ");
  return '<article class="patient-row ' + rowTone(patient) + '">' +
    '<div class="avatar" style="' + avatarStyle(patient.name) + '" aria-hidden="true">' + esc(initials(patient.name)) + "</div>" +
    '<div><a class="row-title" href="#/patient/' + encodeURIComponent(patient.id) + '">' + esc(personTitle(patient)) + "</a>" +
    '<div class="row-meta">' + esc([patient.uhid ? "UHID " + patient.uhid : "", meta].filter(Boolean).join(" · ")) + "</div>" +
    '<div class="badges">' + badges(patient, visit).map((badge) => '<span class="badge ' + badge.tone + '">' + esc(badge.text) + "</span>").join("") + "</div></div>" +
    '<div class="row-action"><a class="mini" href="#/patient/' + encodeURIComponent(patient.id) + '/visit/new">Add visit</a></div></article>';
}

function badges(patient, visit) {
  const items = [];
  if (patient.sample) items.push({ text: "Practice", tone: "plum" });
  const status = followStatus(visit);
  if (!visit) items.push({ text: "No visit yet", tone: "ink" });
  else if (status === "overdue") items.push({ text: "Overdue · due " + formatDate(visit.nextVisit), tone: "red" });
  else if (status === "today") items.push({ text: "Due today", tone: "amber" });
  else if (status === "upcoming") items.push({ text: "Next " + formatDate(visit.nextVisit), tone: "green" });
  else items.push({ text: "No next date", tone: "amber" });
  if (visit && visit.redFlags && visit.redFlags.length) items.push({ text: "Warning signs (" + visit.redFlags.length + ")", tone: "red" });
  if (visit && visit.pathology === "pending") items.push({ text: "Pathology not back", tone: "plum" });
  if (visit && visit.pathology === "available") items.push({ text: "Pathology to discuss", tone: "plum" });
  if (visit && visit.adjuvant && visit.adjuvant !== "undecided") items.push({ text: labelOf(ADJUVANT, visit.adjuvant), tone: "ink" });
  return items.slice(0, 4);
}

function renderPatientForm(main, id) {
  const existing = id ? findPatient(id) : null;
  if (id && !existing) return renderMissing(main);
  const patient = existing || {};
  document.title = (existing ? "Edit patient" : "Add patient") + " · Post-op OPD";
  main.innerHTML = '<div class="wrap">' + storageBanner() +
    '<header class="page-head"><div><h2>' + (existing ? "Edit patient" : "Add patient") + '</h2><p class="lead">Fields with <span class="req">*</span> are needed. The rest can wait.</p></div>' +
    '<div class="actions"><a class="btn ghost" href="' + (existing ? "#/patient/" + encodeURIComponent(existing.id) : "#/") + '">Back</a></div></header>' +
    '<form id="patient-form" novalidate autocomplete="off" data-id="' + esc(existing ? existing.id : "") + '">' +
    '<p class="banner bad" id="form-error" hidden></p>' +
    '<section class="block"><h3>Who the patient is</h3><div class="grid">' +
    field('Full name <span class="req">*</span>', '<input name="name" maxlength="120" spellcheck="false" value="' + esc(patient.name || "") + '"' + (existing ? "" : " autofocus") + " />") +
    field("Age in years", '<input name="age" inputmode="numeric" maxlength="3" value="' + esc(patient.age || "") + '" />') +
    field("UHID or hospital number", '<input name="uhid" maxlength="40" spellcheck="false" value="' + esc(patient.uhid || "") + '" />') +
    field("Phone", '<input name="phone" maxlength="20" inputmode="tel" value="' + esc(patient.phone || "") + '" />') +
    "</div></section>" +
    '<section class="block"><h3>The cancer</h3><div class="grid">' +
    field('Diagnosis <span class="req">*</span>', selectBox("diagnosis", DIAGNOSES, patient.diagnosis || "", "Select the diagnosis")) +
    '<label class="field" id="dx-other"' + (patient.diagnosis === "other" ? "" : " hidden") + '><span>Diagnosis name <span class="req">*</span></span><input name="diagnosisOther" maxlength="160" value="' + esc(patient.diagnosisOther || "") + '" /></label>' +
    field("Histology", '<input name="histology" maxlength="160" placeholder="e.g. high-grade serous carcinoma" value="' + esc(patient.histology || "") + '" />') +
    field("FIGO stage", '<input name="figo" maxlength="40" placeholder="e.g. IIIC" value="' + esc(patient.figo || "") + '" />') +
    "</div></section>" +
    '<section class="block"><h3>The operation</h3><div class="grid">' +
    field('Surgery <span class="req">*</span>', selectBox("surgery", SURGERIES, patient.surgery || "", "Select the operation")) +
    '<label class="field" id="sx-other"' + (patient.surgery === "other" ? "" : " hidden") + '><span>Surgery name <span class="req">*</span></span><input name="surgeryOther" maxlength="160" value="' + esc(patient.surgeryOther || "") + '" /></label>' +
    field('Date of surgery <span class="req">*</span>', '<input name="surgeryDate" type="date" value="' + esc(patient.surgeryDate || "") + '" />') +
    field("Approach", selectBox("approach", APPROACHES, patient.approach || "", "Not recorded")) +
    field("Residual disease", selectBox("residual", RESIDUAL, patient.residual || "", "Not recorded")) +
    field("Days in hospital", '<input name="los" inputmode="numeric" maxlength="3" value="' + esc(patient.los || "") + '" />') +
    "</div></section>" +
    '<section class="block"><h3>Other details</h3><div class="grid">' +
    field("Allergies", '<input name="allergies" maxlength="200" placeholder="Write NKDA if there are none" value="' + esc(patient.allergies || "") + '" />', "span-2") +
    field("Other illnesses", '<input name="comorbidities" maxlength="240" placeholder="e.g. diabetes, hypertension" value="' + esc(patient.comorbidities || "") + '" />', "span-2") +
    field("Baseline notes", '<textarea name="notes" maxlength="2000" spellcheck="true">' + esc(patient.notes || "") + "</textarea>", "span-2") +
    "</div></section>" +
    '<div class="form-actions"><button class="btn primary" type="submit">Save patient</button>' +
    '<a class="btn ghost" href="' + (existing ? "#/patient/" + encodeURIComponent(existing.id) : "#/") + '">Cancel</a>' +
    '<span class="hint-key">Ctrl+S saves</span></div></form>' + foot() + "</div>";
}

function renderPatient(main, id) {
  const patient = findPatient(id);
  if (!patient) return renderMissing(main);
  document.title = patient.name + " · Post-op OPD";
  const visits = visitsOf(patient.id);
  const latest = visits[0];
  const todayPod = pod(patient.surgeryDate, todayISO());
  main.innerHTML = '<div class="wrap">' + storageBanner() + patientBanners(patient, latest) +
    '<header class="page-head"><div><h2>' + esc(patient.name) + '</h2><p class="lead">' + esc(patientLead(patient)) + '</p></div>' +
    '<div class="actions"><a class="btn primary" href="#/patient/' + encodeURIComponent(patient.id) + '/visit/new">Add visit</a>' +
    '<a class="btn" href="#/patient/' + encodeURIComponent(patient.id) + '/edit">Edit details</a>' +
    '<button class="btn danger" type="button" data-action="delete-patient" data-id="' + esc(patient.id) + '">Delete</button></div></header>' +
    '<section class="hero"><div class="facts">' +
    fact("Diagnosis", diagnosisLabel(patient)) +
    fact("Histology and stage", (patient.histology || "Histology not recorded") + " · FIGO " + (patient.figo || "not recorded")) +
    fact("Operation", surgeryLabel(patient) + " · " + (labelOf(APPROACHES, patient.approach) || "Approach not recorded") + " · " + (formatDate(patient.surgeryDate) || "date not recorded") + (patient.los ? " · " + patient.los + " days in hospital" : "")) +
    fact("Today", todayPod === null || Number.isNaN(todayPod) ? "Day count unavailable" : podText(todayPod)) +
    fact("Residual disease", labelOf(RESIDUAL, patient.residual) || "Not recorded") +
    fact("Allergies", patient.allergies || "Not recorded") +
    (patient.comorbidities ? fact("Other illnesses", patient.comorbidities) : "") +
    (patient.phone ? fact("Phone", patient.phone) : "") +
    (patient.notes ? fact("Baseline notes", patient.notes) : "") +
    "</div></section>" +
    '<h3 class="section-label">Visits</h3>' +
    (visits.length ? visits.map((visit) => visitCard(patient, visit)).join("") : '<section class="empty"><h3>No visit yet</h3><p>Add the first OPD note when you see this patient.</p><div class="actions"><a class="btn primary" href="#/patient/' + encodeURIComponent(patient.id) + '/visit/new">Add visit</a></div></section>') +
    foot() + "</div>";
}

function patientLead(patient) {
  return [patient.age ? patient.age + " years" : "", patient.uhid ? "UHID " + patient.uhid : ""].filter(Boolean).join(" · ");
}

function fact(label, value) {
  return "<div><strong>" + esc(label) + "</strong>" + esc(value) + "</div>";
}

function patientBanners(patient, latest) {
  let html = "";
  if (patient.sample) html += '<div class="banner practice">Practice record. Not a real patient. Delete it when you are ready to enter real notes.</div>';
  if (latest && followStatus(latest) === "overdue") html += '<div class="banner warn">Follow-up was due on ' + esc(formatDate(latest.nextVisit)) + ".</div>";
  if (latest && followStatus(latest) === "today") html += '<div class="banner warn">Follow-up is due today.</div>';
  if (latest && latest.redFlags && latest.redFlags.length) html += '<div class="banner bad">Last visit recorded: ' + esc(latest.redFlags.join(", ")) + ". Confirm whether these have settled.</div>";
  return html;
}

function visitCard(patient, visit) {
  const n = pod(patient.surgeryDate, visit.date);
  const bits = [
    labelOf(WOUND, visit.wound) ? "Wound: " + labelOf(WOUND, visit.wound) : "",
    visit.pain !== "" && visit.pain !== undefined && visit.pain !== null ? "Pain " + visit.pain + "/10" : "",
    labelOf(ADJUVANT, visit.adjuvant),
  ].filter(Boolean);
  const flag = visit.redFlags && visit.redFlags.length ? "Warning signs: " + visit.redFlags.join(", ") : "";
  return '<article class="visit"><div><a class="row-title" href="#/patient/' + encodeURIComponent(patient.id) + "/note/" + encodeURIComponent(visit.id) + '">' +
    esc(formatDate(visit.date) || "Visit") + "</a><p>" + esc([n !== null && !Number.isNaN(n) ? podText(n) : "", bits.join(" · "), flag].filter(Boolean).join(" · ")) +
    "</p></div><a class=\"mini\" href=\"#/patient/" + encodeURIComponent(patient.id) + "/visit/" + encodeURIComponent(visit.id) + "\">Edit</a></article>";
}

function renderVisitForm(main, patientId, visitId) {
  const patient = findPatient(patientId);
  if (!patient) return renderMissing(main);
  let existing = null;
  if (visitId) {
    existing = findVisit(visitId);
    if (!existing || existing.patientId !== patient.id) return renderMissing(main);
  }
  const visit = existing || { date: todayISO(), tempUnit: "F" };
  document.title = (existing ? "Edit visit" : "New visit") + " · " + patient.name;
  const previous = visitsOf(patient.id).find((item) => item.id !== (existing && existing.id));
  const showGroin = needsGroin(patient) || (visit.groin && visit.groin !== "");
  main.innerHTML = '<div class="wrap">' + storageBanner() +
    '<header class="page-head"><div><h2>' + (existing ? "Edit visit" : "New visit") + "</h2><p class=\"lead\">" + esc(personTitle(patient)) + " · " + esc(diagnosisLabel(patient)) + "</p></div>" +
    '<div class="actions"><a class="btn ghost" href="#/patient/' + encodeURIComponent(patient.id) + '">Back to patient</a></div></header>' +
    memoryBox(patient, previous) +
    '<form id="visit-form" novalidate autocomplete="off" data-patient-id="' + esc(patient.id) + '" data-visit-id="' + esc(existing ? existing.id : "") + '">' +
    '<p class="banner bad" id="form-error" hidden></p>' +
    '<p class="callout" id="pod-line"></p>' +
    '<section class="block"><h3>This visit</h3><div class="grid">' +
    field("Visit date", '<input name="date" type="date" value="' + esc(visit.date || todayISO()) + '" />') +
    field("Noted by", '<input name="clinician" maxlength="80" value="' + esc(visit.clinician || state.settings.clinician || "") + '" /><span class="hint">Printed on today’s note.</span>') +
    "</div></section>" +
    '<section class="block"><h3>How the patient is</h3><div class="grid">' +
    field("General condition", selectBox("general", GENERAL, visit.general || "", "Not recorded")) +
    field("Pain score, 0 to 10", painPicker(visit.pain) + '<span class="hint">0 is no pain. 10 is the worst pain. Leave blank if you did not ask.</span>') +
    field("Blood pressure (mmHg)", '<div class="split"><input name="bpSys" inputmode="numeric" placeholder="Systolic" value="' + esc(visit.bpSys || "") + '" /><input name="bpDia" inputmode="numeric" placeholder="Diastolic" value="' + esc(visit.bpDia || "") + '" /></div>') +
    field("Pulse (per minute)", '<input name="pulse" inputmode="numeric" value="' + esc(visit.pulse || "") + '" />') +
    field("Temperature", '<div class="split"><input name="temp" inputmode="decimal" value="' + esc(visit.temp || "") + '" /><select name="tempUnit"><option value="F"' + (visit.tempUnit !== "C" ? " selected" : "") + '>°F</option><option value="C"' + (visit.tempUnit === "C" ? " selected" : "") + ">°C</option></select></div>") +
    field("SpO2 (%)", '<input name="spo2" inputmode="numeric" value="' + esc(visit.spo2 || "") + '" />') +
    field("Weight (kg)", '<input name="weight" inputmode="decimal" value="' + esc(visit.weight || "") + '" />') +
    field("Hb (g/dL)", '<input name="hb" inputmode="decimal" value="' + esc(visit.hb || "") + '" />') +
    field("ECOG", selectBox("ecog", ECOG, visit.ecog || "", "Not recorded")) +
    "</div></section>" +
    '<section class="block"><h3>Wound and tubes</h3><div class="grid">' +
    field("Wound", selectBox("wound", WOUND, visit.wound || "", "Not recorded")) +
    (showGroin ? field("Groin or vulvar wound", selectBox("groin", GROIN, visit.groin || "", "Not recorded")) : "") +
    field("Wound note", '<input name="woundNote" maxlength="240" placeholder="Site, dressing, or what you saw" value="' + esc(visit.woundNote || "") + '" />', showGroin ? "" : "span-2") +
    field("Drain", selectBox("drain", DRAIN, visit.drain || "", "Not recorded")) +
    field("Drain output today (ml)", '<input name="drainMl" inputmode="numeric" value="' + esc(visit.drainMl || "") + '" /><span class="hint">Leave blank if there is no drain.</span>') +
    field("Urinary catheter", selectBox("catheter", CATHETER, visit.catheter || "", "Not recorded"), "span-2") +
    "</div></section>" +
    '<section class="block"><h3>Eating, bowels, and movement</h3><div class="grid">' +
    field("Bowels", selectBox("bowel", BOWEL, visit.bowel || "", "Not recorded")) +
    field("Diet", selectBox("diet", DIET, visit.diet || "", "Not recorded")) +
    field("Walking", selectBox("mobility", MOBILITY, visit.mobility || "", "Not recorded")) +
    field("Lymphoedema", selectBox("lymph", LYMPH, visit.lymph || "", "Not recorded")) +
    field("Blood-clot prevention", selectBox("vte", VTE, visit.vte || "", "Not recorded"), "span-2") +
    field("Bladder, sexual health, stoma, or other recovery notes", '<textarea name="functionNote" maxlength="2000">' + esc(visit.functionNote || "") + "</textarea>", "span-2") +
    "</div></section>" +
    '<section class="block warn"><h3>Warning signs today</h3><p class="hint">Tick a sign only if it is present at this visit.</p><div class="check-grid">' +
    FLAGS.map((flag) => '<label class="check"><input type="checkbox" name="redFlags" value="' + esc(flag) + '"' + (visit.redFlags && visit.redFlags.indexOf(flag) !== -1 ? " checked" : "") + " /><span>" + esc(flag) + "</span></label>").join("") +
    '</div><label class="check" style="margin-top:8px"><input type="checkbox" name="warningsExplained" value="yes"' + (visit.warningsExplained ? " checked" : "") + " /><span>I explained which warning signs should bring the patient back sooner.</span></label></section>" +
    '<section class="block plan"><h3>Pathology and your plan</h3><div class="grid">' +
    field("Pathology", selectBox("pathology", PATHOLOGY, visit.pathology || "", "Not recorded")) +
    field("Multidisciplinary meeting", selectBox("mdt", MDT, visit.mdt || "", "Not recorded")) +
    field("Pathology note", '<textarea name="pathologyNote" maxlength="2000">' + esc(visit.pathologyNote || "") + "</textarea>", "span-2") +
    field("Adjuvant plan", selectBox("adjuvant", ADJUVANT, visit.adjuvant || "", "Not recorded")) +
    field("CA-125, if you use it", '<input name="ca125" inputmode="decimal" value="' + esc(visit.ca125 || "") + '" />') +
    field("Plan in your own words", '<textarea name="planNote" maxlength="4000" placeholder="What you decided, referrals, and cycle timing. Write drug names only if you want them in the note.">' + esc(visit.planNote || "") + "</textarea>", "span-2") +
    "</div></section>" +
    '<section class="block"><h3>Medicines, advice, and the next visit</h3><div class="grid">' +
    field("Medicines", '<textarea name="medicines" maxlength="4000" placeholder="Write the dose and how often yourself.">' + esc(visit.medicines || "") + "</textarea>" +
      '<span class="quick">' + MED_LINES.map((line) => '<button type="button" data-action="insert-med" data-line="' + esc(line) + '">' + esc(line.replace(/ —\s*$/, "")) + "</button>").join("") + "</span><span class=\"hint\">These buttons only add a blank line. They do not choose a dose.</span>", "span-2") +
    field("Advice given", '<textarea name="advice" maxlength="4000">' + esc(visit.advice || "") + "</textarea>" +
      '<span class="quick"><button type="button" data-action="insert-advice">Insert standard safety advice</button></span>', "span-2") +
    field("Next visit", '<input name="nextVisit" type="date" value="' + esc(visit.nextVisit || "") + '" />') +
    "</div></section>" +
    '<div class="form-actions"><button class="btn primary" type="submit">' + (existing ? "Save changes" : "Save visit") + "</button>" +
    '<a class="btn ghost" href="#/patient/' + encodeURIComponent(patient.id) + '">Cancel</a>' +
    '<span class="hint-key">Ctrl+S saves</span></div></form>' + foot() + "</div>";
  refreshPodLine();
}

function painPicker(current) {
  const value = current === 0 || current ? String(current) : "";
  const buttons = [];
  for (let n = 0; n <= 10; n++) {
    const tone = n <= 3 ? "low" : n <= 6 ? "mid" : "high";
    const on = String(n) === value;
    buttons.push('<button type="button" class="pain-btn ' + tone + (on ? " on" : "") + '" data-action="set-pain" data-value="' + n + '" aria-pressed="' + (on ? "true" : "false") + '">' + n + "</button>");
  }
  return '<div class="pain" role="radiogroup" aria-label="Pain score">' + buttons.join("") + '</div><input type="hidden" name="pain" value="' + esc(value) + '" />';
}

function memoryBox(patient, visit) {
  if (!visit) return "";
  const n = pod(patient.surgeryDate, visit.date);
  const lines = [
    labelOf(WOUND, visit.wound) ? "Wound: " + labelOf(WOUND, visit.wound) : "",
    visit.pain !== "" && visit.pain !== undefined && visit.pain !== null ? "Pain " + visit.pain + "/10" : "",
    visit.planNote ? "Plan: " + visit.planNote : "",
    visit.nextVisit ? "Next visit was set for " + formatDate(visit.nextVisit) : "",
    visit.redFlags && visit.redFlags.length ? "Warning signs: " + visit.redFlags.join(", ") : "",
  ].filter(Boolean);
  return '<aside class="memory"><p class="kicker">Last visit · for your memory only · not copied into today</p><p><strong>' +
    esc(formatDate(visit.date)) + (n !== null && !Number.isNaN(n) ? " · " + esc(podText(n)) : "") + "</strong></p>" +
    lines.map((line) => "<p>" + esc(line) + "</p>").join("") + "</aside>";
}

function renderNote(main, patientId, visitId) {
  const patient = findPatient(patientId);
  const visit = findVisit(visitId);
  if (!patient || !visit || visit.patientId !== patient.id) return renderMissing(main);
  document.title = "Note · " + patient.name;
  const model = noteModel(patient, visit);
  main.innerHTML = '<div class="wrap">' + storageBanner() +
    '<header class="page-head no-print"><div><h2>Visit note</h2><p class="lead">' + esc(patient.name) + " · " + esc(formatDate(visit.date)) + "</p></div>" +
    '<div class="actions"><button class="btn primary" type="button" data-action="copy-note" data-patient="' + esc(patient.id) + '" data-visit="' + esc(visit.id) + '">Copy note</button>' +
    '<button class="btn" type="button" data-action="print-note">Print</button>' +
    '<a class="btn" href="#/patient/' + encodeURIComponent(patient.id) + "/visit/" + encodeURIComponent(visit.id) + '">Edit</a>' +
    '<button class="btn danger" type="button" data-action="delete-visit" data-id="' + esc(visit.id) + '" data-patient="' + esc(patient.id) + '">Delete visit</button>' +
    '<a class="btn ghost" href="#/patient/' + encodeURIComponent(patient.id) + '">Back to patient</a></div></header>' +
    noteToHtml(model) + foot() + "</div>";
}

function renderMissing(main) {
  document.title = "Not found · Post-op OPD";
  main.innerHTML = '<div class="wrap"><section class="empty"><h3>That page is not in this book</h3><p>The patient or visit may have been deleted on this computer.</p><div class="actions"><a class="btn primary" href="#/">Back to clinic list</a></div></section></div>';
}

function noteModel(patient, visit) {
  const n = pod(patient.surgeryDate, visit.date);
  return {
    practice: !!patient.sample,
    fileNo: patient.uhid || "Not recorded",
    date: formatDate(visit.date) || "Not recorded",
    clinician: visit.clinician || "Not recorded",
    identity: [
      ["Patient", personTitle(patient)],
      ["Phone", patient.phone || "Not recorded"],
      ["Diagnosis", diagnosisLine(patient)],
      ["Surgery", surgeryLine(patient)],
      ["Post-operative day", podText(n)],
      ["Allergies", patient.allergies || "Not recorded"],
      ["Other illnesses", patient.comorbidities || "Not recorded"],
    ],
    sections: [
      ["How the patient is", howText(visit)],
      ["Wound and tubes", woundText(visit)],
      ["Eating, bowels, and movement", functionText(visit)],
      ["Warning signs", flagText(visit)],
      ["Pathology and plan", planText(visit)],
      ["Medicines", visit.medicines && visit.medicines.trim() ? visit.medicines.trim() : "Not recorded"],
      ["Advice given", adviceText(visit)],
      ["Next visit", visit.nextVisit ? formatDate(visit.nextVisit) : "Not recorded"],
    ],
    updated: formatDateTime(visit.updatedAt || visit.createdAt),
  };
}

function diagnosisLine(patient) {
  return [diagnosisLabel(patient), patient.histology, patient.figo ? "FIGO " + patient.figo : ""].filter(Boolean).join(" · ");
}

function surgeryLine(patient) {
  return [surgeryLabel(patient), labelOf(APPROACHES, patient.approach), formatDate(patient.surgeryDate), labelOf(RESIDUAL, patient.residual), patient.los ? patient.los + " days in hospital" : ""].filter(Boolean).join(" · ");
}

function howText(visit) {
  const lines = ["General condition: " + (labelOf(GENERAL, visit.general) || "Not recorded")];
  const vitals = [];
  if (visit.bpSys || visit.bpDia) vitals.push("Blood pressure " + (visit.bpSys || "—") + "/" + (visit.bpDia || "—") + " mmHg");
  if (visit.pulse) vitals.push("Pulse " + visit.pulse + "/min");
  if (visit.temp) vitals.push("Temperature " + visit.temp + " °" + (visit.tempUnit === "C" ? "C" : "F"));
  if (visit.spo2) vitals.push("SpO2 " + visit.spo2 + "%");
  if (visit.weight) vitals.push("Weight " + visit.weight + " kg");
  if (visit.hb) vitals.push("Hb " + visit.hb + " g/dL");
  lines.push(vitals.length ? vitals.join(" · ") : "Vitals: not recorded");
  lines.push("Pain score: " + (visit.pain === "" || visit.pain === undefined || visit.pain === null ? "Not recorded" : visit.pain + "/10"));
  if (visit.ecog) lines.push("ECOG: " + (labelOf(ECOG, visit.ecog) || visit.ecog));
  return lines.join("\n");
}

function woundText(visit) {
  const lines = ["Wound: " + (labelOf(WOUND, visit.wound) || "Not recorded")];
  if (visit.woundNote && visit.woundNote.trim()) lines.push(visit.woundNote.trim());
  if (visit.groin) lines.push("Groin or vulvar wound: " + (labelOf(GROIN, visit.groin) || visit.groin));
  let drain = "Drain: " + (labelOf(DRAIN, visit.drain) || "Not recorded");
  if (visit.drainMl) drain += ". Output today: " + visit.drainMl + " ml";
  lines.push(drain);
  lines.push("Urinary catheter: " + (labelOf(CATHETER, visit.catheter) || "Not recorded"));
  return lines.join("\n");
}

function functionText(visit) {
  const lines = [
    "Bowels: " + (labelOf(BOWEL, visit.bowel) || "Not recorded"),
    "Diet: " + (labelOf(DIET, visit.diet) || "Not recorded"),
    "Walking: " + (labelOf(MOBILITY, visit.mobility) || "Not recorded"),
    "Lymphoedema: " + (labelOf(LYMPH, visit.lymph) || "Not recorded"),
    "Blood-clot prevention: " + (labelOf(VTE, visit.vte) || "Not recorded"),
  ];
  if (visit.functionNote && visit.functionNote.trim()) lines.push(visit.functionNote.trim());
  return lines.join("\n");
}

function flagText(visit) {
  if (visit.redFlags && visit.redFlags.length) return "Present today:\n" + visit.redFlags.map((flag) => "• " + flag).join("\n");
  return "No warning signs were ticked at this visit.";
}

function planText(visit) {
  const lines = [
    "Pathology: " + (labelOf(PATHOLOGY, visit.pathology) || "Not recorded"),
    "Multidisciplinary meeting: " + (labelOf(MDT, visit.mdt) || "Not recorded"),
  ];
  if (visit.pathologyNote && visit.pathologyNote.trim()) lines.push(visit.pathologyNote.trim());
  lines.push("Adjuvant plan: " + (labelOf(ADJUVANT, visit.adjuvant) || "Not recorded"));
  if (visit.ca125) lines.push("CA-125: " + visit.ca125);
  if (visit.planNote && visit.planNote.trim()) lines.push(visit.planNote.trim());
  return lines.join("\n");
}

function adviceText(visit) {
  const explained = visit.warningsExplained
    ? "Home warning signs were explained."
    : "Home warning signs: not marked as explained.";
  const body = visit.advice && visit.advice.trim() ? visit.advice.trim() : "No other advice written.";
  return explained + "\n\n" + body;
}

function noteToText(model) {
  const lines = [];
  if (model.practice) lines.push("PRACTICE RECORD — NOT A REAL PATIENT", "");
  lines.push("POST-OPERATIVE OPD NOTE", "Gynecologic oncology", "", "Date: " + model.date, "Noted by: " + model.clinician, "UHID: " + model.fileNo, "");
  model.identity.forEach((row) => lines.push(row[0] + ": " + row[1]));
  model.sections.forEach((section) => {
    lines.push("", section[0].toUpperCase(), section[1]);
  });
  lines.push("", "Noted by: " + model.clinician, model.updated ? "Record updated: " + model.updated : "", "Entered by the treating doctor in the Post-op OPD book.");
  return lines.filter((line, index, all) => !(line === "" && all[index - 1] === "")).join("\n");
}

function noteToHtml(model) {
  const practice = model.practice ? '<div class="banner practice">PRACTICE RECORD — NOT A REAL PATIENT</div>' : "";
  const rows = model.identity.map((row) => "<dt>" + esc(row[0]) + "</dt><dd>" + esc(row[1]) + "</dd>").join("");
  const sections = model.sections.map((section) => '<section class="note-block"><h3>' + esc(section[0]) + '</h3><p class="pre">' + esc(section[1]) + "</p></section>").join("");
  return '<article class="note-sheet">' + practice +
    '<div class="note-top"><div><p class="note-kicker">Gynecologic oncology</p><h2>Post-operative OPD note</h2></div>' +
    '<div class="file-no"><span>UHID</span><strong>' + esc(model.fileNo) + "</strong></div></div>" +
    '<hr class="rule" />' +
    '<dl class="id-grid"><dt>Date</dt><dd>' + esc(model.date) + "</dd><dt>Noted by</dt><dd>" + esc(model.clinician) + "</dd>" + rows + "</dl>" +
    sections +
    '<div class="sign"><div class="line">' + esc(model.clinician) + "<br />Gynecologic oncology</div></div>" +
    '<p class="footnote">' + esc(model.updated ? "Record updated " + model.updated + ". " : "") + "Entered by the treating doctor in the Post-op OPD book. This notebook does not diagnose or prescribe.</p></article>";
}

function showError(message, focusName) {
  const el = document.getElementById("form-error");
  if (!el) {
    toast(message);
    return;
  }
  el.hidden = false;
  el.textContent = message;
  const field = focusName ? document.querySelector('#main [name="' + focusName + '"]') : null;
  if (field) field.focus();
  el.scrollIntoView({ block: "center" });
}

function readOptionalNumber(raw, label, focusName) {
  const text = String(raw ?? "").trim();
  if (!text) return "";
  if (!/^\d+(\.\d+)?$/.test(text)) {
    showError("Please check " + label + ". Use a number, or leave it blank.", focusName);
    return null;
  }
  return text;
}

function savePatient(form) {
  const data = new FormData(form);
  const get = (name) => String(data.get(name) ?? "").trim();
  const existing = form.dataset.id ? findPatient(form.dataset.id) : null;
  const name = get("name").replace(/\s+/g, " ");
  const diagnosis = get("diagnosis");
  const surgery = get("surgery");
  const surgeryDate = get("surgeryDate");
  const age = get("age");
  if (!name) return showError("Please enter the patient name.", "name");
  if (age && (!/^\d{1,3}$/.test(age) || Number(age) < 1 || Number(age) > 120)) return showError("Please enter age in years, or leave it blank.", "age");
  if (!diagnosis) return showError("Please select the diagnosis.", "diagnosis");
  if (diagnosis === "other" && !get("diagnosisOther")) return showError("Please type the diagnosis name.", "diagnosisOther");
  if (!surgery) return showError("Please select the operation.", "surgery");
  if (surgery === "other" && !get("surgeryOther")) return showError("Please type the operation name.", "surgeryOther");
  if (!surgeryDate) return showError("Please enter the date of surgery.", "surgeryDate");
  const los = readOptionalNumber(get("los"), "days in hospital", "los");
  if (los === null) return;
  const issues = [];
  if (surgeryDate > todayISO()) issues.push("The surgery date is in the future.");
  if (issues.length && !confirm(issues.join("\n") + "\n\nSave anyway?")) return;
  const patient = {
    id: existing ? existing.id : uid(),
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sample: !!(existing && existing.sample),
    name: name,
    age: age,
    uhid: get("uhid"),
    phone: get("phone"),
    diagnosis: diagnosis,
    diagnosisOther: diagnosis === "other" ? get("diagnosisOther") : "",
    histology: get("histology"),
    figo: get("figo"),
    surgery: surgery,
    surgeryOther: surgery === "other" ? get("surgeryOther") : "",
    surgeryDate: surgeryDate,
    approach: get("approach"),
    residual: get("residual"),
    los: los,
    allergies: get("allergies"),
    comorbidities: get("comorbidities"),
    notes: get("notes"),
  };
  if (existing) state.patients = state.patients.map((item) => item.id === patient.id ? patient : item);
  else state.patients.push(patient);
  persist();
  toast(existing ? "Patient details updated." : "Patient saved. You can add the first visit now.");
  go("#/patient/" + patient.id);
}

function saveVisit(form) {
  const data = new FormData(form);
  const get = (name) => String(data.get(name) ?? "").trim();
  const patient = findPatient(form.dataset.patientId);
  if (!patient) return showError("This patient is no longer on the list.");
  const existing = form.dataset.visitId ? findVisit(form.dataset.visitId) : null;
  const date = get("date");
  if (!date) return showError("Please enter the visit date.", "date");
  const numbers = {
    bpSys: readOptionalNumber(get("bpSys"), "the systolic blood pressure", "bpSys"),
    bpDia: readOptionalNumber(get("bpDia"), "the diastolic blood pressure", "bpDia"),
    pulse: readOptionalNumber(get("pulse"), "the pulse", "pulse"),
    temp: readOptionalNumber(get("temp"), "the temperature", "temp"),
    spo2: readOptionalNumber(get("spo2"), "the oxygen saturation", "spo2"),
    weight: readOptionalNumber(get("weight"), "the weight", "weight"),
    hb: readOptionalNumber(get("hb"), "the haemoglobin", "hb"),
    drainMl: readOptionalNumber(get("drainMl"), "the drain output", "drainMl"),
    ca125: readOptionalNumber(get("ca125"), "the CA-125", "ca125"),
  };
  if (Object.values(numbers).some((value) => value === null)) return;
  const pain = get("pain");
  if (pain && !/^(10|[0-9])$/.test(pain)) return showError("Please choose a pain score from 0 to 10, or leave it blank.", "pain");
  const issues = [];
  if (date > todayISO()) issues.push("The visit date is in the future.");
  const nextVisit = get("nextVisit");
  if (nextVisit && nextVisit < date) issues.push("The next visit is dated before this visit.");
  const n = pod(patient.surgeryDate, date);
  if (n !== null && n < 0) issues.push("This visit date is before the surgery date.");
  oddVitals(numbers, get("tempUnit")).forEach((line) => issues.push(line));
  if (issues.length && !confirm(issues.join("\n") + "\n\nSave anyway?")) return;
  const clinician = get("clinician");
  const visit = {
    id: existing ? existing.id : uid(),
    patientId: patient.id,
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    date: date,
    clinician: clinician,
    general: get("general"),
    pain: pain,
    bpSys: numbers.bpSys,
    bpDia: numbers.bpDia,
    pulse: numbers.pulse,
    temp: numbers.temp,
    tempUnit: get("tempUnit") === "C" ? "C" : "F",
    spo2: numbers.spo2,
    weight: numbers.weight,
    hb: numbers.hb,
    ecog: get("ecog"),
    wound: get("wound"),
    woundNote: get("woundNote"),
    groin: get("groin"),
    drain: get("drain"),
    drainMl: numbers.drainMl,
    catheter: get("catheter"),
    bowel: get("bowel"),
    diet: get("diet"),
    mobility: get("mobility"),
    lymph: get("lymph"),
    vte: get("vte"),
    functionNote: get("functionNote"),
    redFlags: data.getAll("redFlags").map(String),
    warningsExplained: data.get("warningsExplained") === "yes",
    pathology: get("pathology"),
    pathologyNote: get("pathologyNote"),
    mdt: get("mdt"),
    adjuvant: get("adjuvant"),
    ca125: numbers.ca125,
    planNote: get("planNote"),
    medicines: get("medicines"),
    advice: get("advice"),
    nextVisit: nextVisit,
  };
  if (existing) state.visits = state.visits.map((item) => item.id === visit.id ? visit : item);
  else state.visits.push(visit);
  if (clinician) {
    state.settings.clinician = clinician;
    const nameInput = document.getElementById("clinician");
    if (nameInput) nameInput.value = clinician;
  }
  persist();
  toast("Visit saved.");
  go("#/patient/" + patient.id + "/note/" + visit.id);
}

function oddVitals(numbers, unit) {
  const issues = [];
  const temp = numbers.temp === "" ? null : Number(numbers.temp);
  if (temp !== null) {
    if (unit === "C" && (temp < 35 || temp > 41)) issues.push("Temperature looks unusual for °C.");
    if (unit !== "C" && (temp < 95 || temp > 106)) issues.push("Temperature looks unusual for °F. Check that the unit is right.");
  }
  const pulse = numbers.pulse === "" ? null : Number(numbers.pulse);
  if (pulse !== null && (pulse < 40 || pulse > 180)) issues.push("Pulse looks unusual.");
  const spo2 = numbers.spo2 === "" ? null : Number(numbers.spo2);
  if (spo2 !== null && (spo2 < 80 || spo2 > 100)) issues.push("Oxygen saturation looks unusual.");
  const sys = numbers.bpSys === "" ? null : Number(numbers.bpSys);
  const dia = numbers.bpDia === "" ? null : Number(numbers.bpDia);
  if (sys !== null && (sys < 70 || sys > 220)) issues.push("Systolic blood pressure looks unusual.");
  if (dia !== null && (dia < 30 || dia > 140)) issues.push("Diastolic blood pressure looks unusual.");
  return issues;
}

function refreshPodLine() {
  const form = document.getElementById("visit-form");
  const line = document.getElementById("pod-line");
  if (!form || !line) return;
  const patient = findPatient(form.dataset.patientId);
  if (!patient) return;
  const date = form.querySelector('[name="date"]').value;
  const n = pod(patient.surgeryDate, date);
  line.textContent = podText(n);
  line.classList.toggle("bad", n !== null && n < 0);
}

function toggleWrap(selectName, wrapId) {
  const sel = document.querySelector('#main [name="' + selectName + '"]');
  const wrap = document.getElementById(wrapId);
  if (!sel || !wrap) return;
  wrap.hidden = sel.value !== "other";
}

function addSample() {
  const existing = state.patients.find((patient) => patient.sample);
  if (existing) {
    toast("The practice patient is already on the list.");
    go("#/patient/" + existing.id);
    return;
  }
  const today = todayISO();
  const patient = {
    id: uid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sample: true,
    name: "Meera Nair (practice)",
    age: "62",
    uhid: "SAMPLE-001",
    phone: "",
    diagnosis: "ovarian",
    diagnosisOther: "",
    histology: "High-grade serous carcinoma",
    figo: "IIIC",
    surgery: "ics",
    surgeryOther: "",
    surgeryDate: shiftISO(today, -20),
    approach: "open",
    residual: "r0",
    los: "7",
    allergies: "NKDA",
    comorbidities: "Hypertension",
    notes: "Fictional record for learning the pages. Not a real patient.",
  };
  const visit = {
    id: uid(),
    patientId: patient.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    date: shiftISO(today, -5),
    clinician: state.settings.clinician || "",
    general: "comfortable",
    pain: "2",
    bpSys: "128",
    bpDia: "76",
    pulse: "84",
    temp: "98.2",
    tempUnit: "F",
    spo2: "98",
    weight: "61",
    hb: "10.6",
    ecog: "1",
    wound: "healthy",
    woundNote: "Midline wound dry. Clips removed.",
    groin: "",
    drain: "out",
    drainMl: "",
    catheter: "voiding",
    bowel: "stool",
    diet: "normal",
    mobility: "independent",
    lymph: "none",
    vte: "heparin",
    functionNote: "Passing urine well. No bothersome vaginal bleeding.",
    redFlags: [],
    warningsExplained: true,
    pathology: "discussed",
    pathologyNote: "High-grade serous carcinoma, discussed with the patient.",
    mdt: "done",
    adjuvant: "chemo",
    ca125: "86",
    planNote: "Adjuvant chemotherapy was discussed. The day-care date is still to be confirmed.",
    medicines: "Paracetamol — as prescribed\nA stomach-acid tablet — as prescribed",
    advice: STANDARD_ADVICE,
    nextVisit: shiftISO(today, -1),
  };
  state.patients.push(patient);
  state.visits.push(visit);
  persist();
  toast("Practice patient added. You can delete this record later.");
  go("#/patient/" + patient.id);
}

function downloadBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = "post-op-opd-backup-" + todayISO() + ".json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast("Backup downloaded. Keep that file somewhere safe.");
}

function restoreBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result || ""));
      if (!data || !Array.isArray(data.patients) || !Array.isArray(data.visits)) {
        toast("That file is not a backup from this app.");
        return;
      }
      if (!confirm("Replace all notes on this computer with this backup?")) return;
      const next = {
        version: 1,
        patients: data.patients.filter((p) => p && typeof p.id === "string" && typeof p.name === "string"),
        visits: data.visits.filter((v) => v && typeof v.id === "string" && typeof v.patientId === "string" && data.patients.some((p) => p && p.id === v.patientId)),
        settings: {
          clinician: (data.settings && data.settings.clinician) || state.settings.clinician || "",
          welcomeDismissed: !!(data.settings && data.settings.welcomeDismissed),
        },
      };
      state = next;
      const nameInput = document.getElementById("clinician");
      if (nameInput) nameInput.value = state.settings.clinician || "";
      persist();
      toast("Backup restored.");
      go("#/");
    } catch (err) {
      toast("Could not read that file.");
    }
  };
  reader.readAsText(file);
}

function copyText(text) {
  const done = () => toast("Note copied. You can paste it into the hospital record.");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else fallbackCopy(text, done);
}

function fallbackCopy(text, done) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "0";
  area.style.top = "0";
  document.body.appendChild(area);
  area.focus();
  area.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
  area.remove();
  if (ok) done();
  else showCopyBox(text);
}

function showCopyBox(text) {
  let box = document.getElementById("copy-box");
  if (!box) {
    box = document.createElement("div");
    box.id = "copy-box";
    box.className = "copy-box";
    box.innerHTML = '<div class="copy-card" role="dialog" aria-modal="true" aria-labelledby="copy-title"><h3 id="copy-title">Copy this note</h3><p>The note is selected below. Press Ctrl+C, then paste it into the hospital record.</p><textarea id="copy-text" readonly></textarea><button class="btn primary" type="button" id="copy-close">Close</button></div>';
    document.body.appendChild(box);
    document.getElementById("copy-close").addEventListener("click", () => { box.hidden = true; });
  }
  box.hidden = false;
  const area = document.getElementById("copy-text");
  area.value = text;
  area.focus();
  area.select();
}

function onClick(event) {
  const link = event.target.closest('a[href^="#"]');
  if (link && formDirty) {
    const ok = confirm("Leave this page? What you have typed will not be saved.");
    if (!ok) {
      event.preventDefault();
      return;
    }
    formDirty = false;
  }
  const btn = event.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "filter") {
    ui.filter = btn.dataset.filter || "all";
    document.querySelectorAll('[data-action="filter"]').forEach((chip) => chip.classList.toggle("on", chip === btn));
    paintList();
    return;
  }
  if (action === "set-pain") {
    const form = btn.closest("form");
    if (!form) return;
    const hidden = form.querySelector('[name="pain"]');
    const turningOff = btn.classList.contains("on");
    form.querySelectorAll(".pain-btn").forEach((item) => {
      item.classList.remove("on");
      item.setAttribute("aria-pressed", "false");
    });
    hidden.value = turningOff ? "" : btn.dataset.value;
    if (!turningOff) {
      btn.classList.add("on");
      btn.setAttribute("aria-pressed", "true");
    }
    formDirty = true;
    return;
  }
  if (action === "insert-med") {
    const area = document.querySelector('#visit-form [name="medicines"]');
    if (!area) return;
    const line = btn.dataset.line || "";
    area.value = area.value.trim() ? area.value.replace(/\s+$/, "") + "\n" + line : line;
    area.focus();
    formDirty = true;
    return;
  }
  if (action === "insert-advice") {
    const area = document.querySelector('#visit-form [name="advice"]');
    if (!area) return;
    if (!area.value.trim()) area.value = STANDARD_ADVICE;
    else if (confirm("Add the standard advice below what you have already written?")) area.value = area.value.replace(/\s+$/, "") + "\n\n" + STANDARD_ADVICE;
    area.focus();
    formDirty = true;
    return;
  }
  if (action === "dismiss-welcome") {
    state.settings.welcomeDismissed = true;
    persist();
    render();
    return;
  }
  if (action === "add-sample") {
    addSample();
    return;
  }
  if (action === "export") {
    downloadBackup();
    return;
  }
  if (action === "restore") {
    document.getElementById("restore-file").click();
    return;
  }
  if (action === "wipe") {
    if (!confirm("Delete every patient and visit stored in this browser?")) return;
    if (!confirm("This cannot be undone. Delete all records?")) return;
    state.patients = [];
    state.visits = [];
    persist();
    toast("All records deleted from this browser.");
    go("#/");
    return;
  }
  if (action === "delete-patient") {
    const patient = findPatient(btn.dataset.id);
    if (!patient) return;
    if (!confirm("Remove " + patient.name + " and all visit notes from this computer?")) return;
    if (!confirm("This cannot be undone unless you have a backup. Remove the patient?")) return;
    state.patients = state.patients.filter((item) => item.id !== patient.id);
    state.visits = state.visits.filter((item) => item.patientId !== patient.id);
    persist();
    toast("Patient removed from this computer.");
    go("#/");
    return;
  }
  if (action === "delete-visit") {
    const visit = findVisit(btn.dataset.id);
    if (!visit) return;
    if (!confirm("Delete this visit note?")) return;
    state.visits = state.visits.filter((item) => item.id !== visit.id);
    persist();
    toast("Visit deleted.");
    go("#/patient/" + btn.dataset.patient);
    return;
  }
  if (action === "copy-note") {
    const patient = findPatient(btn.dataset.patient);
    const visit = findVisit(btn.dataset.visit);
    if (!patient || !visit) return;
    copyText(noteToText(noteModel(patient, visit)));
    return;
  }
  if (action === "print-note") window.print();
}

function onInput(event) {
  if (event.target.id === "search") {
    ui.query = event.target.value;
    paintList();
    return;
  }
  if (event.target.id === "clinician") {
    state.settings.clinician = event.target.value;
    persist();
    return;
  }
  if (event.target.closest("#main form")) formDirty = true;
  if (event.target.name === "clinician" && event.target.form && event.target.form.id === "visit-form") {
    state.settings.clinician = event.target.value;
    const side = document.getElementById("clinician");
    if (side && side.value !== event.target.value) side.value = event.target.value;
    persist();
  }
}

function onChange(event) {
  if (event.target.closest("#main form")) formDirty = true;
  if (event.target.name === "date") refreshPodLine();
  if (event.target.name === "diagnosis") toggleWrap("diagnosis", "dx-other");
  if (event.target.name === "surgery") toggleWrap("surgery", "sx-other");
}

function onSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.closest("#main")) return;
  event.preventDefault();
  if (form.id === "patient-form") savePatient(form);
  if (form.id === "visit-form") saveVisit(form);
}

function onKeydown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    const form = document.querySelector("#main form");
    if (!form) return;
    event.preventDefault();
    if (form.requestSubmit) form.requestSubmit();
    else form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  }
}

function init() {
  state = load();
  const clinician = document.getElementById("clinician");
  if (clinician) clinician.value = state.settings.clinician || "";
  document.addEventListener("click", onClick);
  document.addEventListener("input", onInput);
  document.addEventListener("change", onChange);
  document.addEventListener("submit", onSubmit);
  document.addEventListener("keydown", onKeydown);
  document.getElementById("restore-file").addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (file) restoreBackup(file);
  });
  window.addEventListener("hashchange", render);
  window.addEventListener("beforeunload", (event) => {
    if (!formDirty) return;
    event.preventDefault();
    event.returnValue = "";
  });
  render();
}

init();
