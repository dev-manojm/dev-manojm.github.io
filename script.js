(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const node = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formatDate = value => {
    if (!value) return "";
    if (value.toLowerCase() === "present") return "Present";
    const [year, month] = value.split("-");
    const monthIndex = Number(month) - 1;
    return monthNames[monthIndex] ? `${monthNames[monthIndex]} ${year}` : value;
  };
  const dateRange = (start, end) => [formatDate(start), formatDate(end)].filter(Boolean).join(" — ");

  function renderExperience(items) {
    const list = $("#experience-list");
    list.replaceChildren();
    items.forEach((item, index) => {
      const article = node("article", "experience-row reveal");
      const marker = node("div", "experience-marker", String(index + 1).padStart(2, "0"));
      const content = node("div", "experience-content");
      const top = node("div", "experience-top");
      const heading = node("h3", "", item.employer);
      const dates = node("span", "date-range", dateRange(item.start_date, item.end_date));
      top.append(heading, dates);
      content.append(top, node("p", "experience-title", item.title));
      if (item.positions?.length) {
        const roles = node("div", "role-chips");
        item.positions.forEach(role => {
          const chip = node("span", "role-chip");
          chip.append(node("strong", "", role.title), node("small", "", dateRange(role.start_date, role.end_date)));
          roles.append(chip);
        });
        content.append(roles);
      }
      article.append(marker, content);
      list.append(article);
    });
  }

  function renderProjects(items) {
    const grid = $("#project-grid");
    grid.replaceChildren();
    items.forEach((item, index) => {
      const card = node("article", `project-card project-card-${index + 1} reveal`);
      const header = node("div", "project-card-top");
      header.append(node("span", "project-index", `0${index + 1}`), node("span", "project-symbol", ["↗", "⌘", "◌", "▤", "✳", "⇄"][index % 6]));
      const title = node("h3", "", item.title);
      const summary = node("p", "project-summary", item.summary);
      const tags = node("div", "tag-row");
      item.technologies.forEach(tech => tags.append(node("span", "tech-tag", tech)));
      card.append(header, title, summary, tags);
      grid.append(card);
    });
    $("#project-stat").textContent = String(items.length).padStart(2, "0");
  }

  const groups = [
    { title: "Cloud platforms", keys: ["Google Cloud Platform (GCP)", "Amazon Web Services (AWS)", "Azure Service Bus", "BigQuery", "Snowflake", "Databricks"] },
    { title: "Data engineering", keys: ["Apache Kafka", "Pub/Sub", "Dataflow", "dbt", "Apache Airflow", "Matillion ETL", "Change Data Capture (CDC)"] },
    { title: "Engineering and modeling", keys: ["Python", "SQL", "PySpark", "Terraform", "Data modeling", "Data quality"] },
    { title: "Analytics and BI", keys: ["Power BI", "Tableau", "Looker", "Sigma BI"] },
  ];

  function renderSkills(skills) {
    const root = $("#skill-groups");
    root.replaceChildren();
    groups.forEach((group, index) => {
      const present = group.keys.filter(skill => skills.includes(skill));
      if (!present.length) return;
      const article = node("article", "skill-group reveal");
      const heading = node("h3", "");
      heading.append(node("span", "skill-group-number", `0${index + 1}`), document.createTextNode(group.title));
      const tags = node("div", "skill-tags");
      present.forEach(skill => tags.append(node("span", "skill-tag", skill)));
      article.append(heading, tags);
      root.append(article);
    });
  }

  function renderAchievements(items) {
    const grid = $("#achievement-grid");
    grid.replaceChildren();
    items.forEach(item => {
      const card = node("article", "recognition-card reveal");
      card.append(node("span", "recognition-star", "✳"), node("h3", "", item.title));
      if (item.detail) card.append(node("p", "", item.detail));
      if (item.date) card.append(node("span", "recognition-date", item.date));
      grid.append(card);
    });
  }

  function renderEducation(items, certifications) {
    const degree = items.find(item => item.title?.includes("Bachelor"));
    if (degree) $("#education-title").textContent = `${degree.institution} · ${formatDate(degree.start_date)}–${formatDate(degree.end_date)}`;
    if (certifications?.length) $("#certification-list").textContent = certifications.join(" · ");
  }

  function setExternalLink(element, link) {
    if (!element || !link?.url) return;
    try {
      const url = new URL(link.url);
      if (url.protocol !== "https:") return;
      element.href = url.href;
    } catch { /* keep the safe fallback */ }
  }

  function configureLogin() {
    const url = String(window.PORTFOLIO_CONFIG?.loginUrl || "").trim();
    if (!url) return;
    try {
      const destination = new URL(url);
      if (destination.protocol !== "https:" || destination.username || destination.password || destination.port) return;
      const loginLink = $("#login-link");
      loginLink.href = destination.href;
      loginLink.removeAttribute("aria-disabled");
      loginLink.removeAttribute("tabindex");
    } catch { /* keep the sign-in disabled until a valid HTTPS URL is configured */ }
  }

  function observeReveals() {
    const targets = document.querySelectorAll(".reveal:not(.is-visible)");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      targets.forEach(item => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });
    targets.forEach(item => observer.observe(item));
  }

  function showLoadError() {
    $("#hero-summary").textContent = "Portfolio details are temporarily unavailable. Please refresh in a moment.";
    ["#experience-list", "#project-grid", "#skill-groups", "#achievement-grid"].forEach(selector => {
      const root = $(selector);
      if (root) root.replaceChildren(node("p", "loading-card", "Portfolio data could not be loaded."));
    });
  }

  async function init() {
    $("#current-year").textContent = new Date().getFullYear();
    const menuButton = $(".menu-toggle");
    const nav = $("#site-nav");
    menuButton.addEventListener("click", () => {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      menuButton.setAttribute("aria-label", expanded ? "Open menu" : "Close menu");
      nav.classList.toggle("is-open", !expanded);
    });
    nav.addEventListener("click", event => {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open menu");
      }
    });
    configureLogin();

    try {
      const response = await fetch("portfolio-data.json", { cache: "no-cache", credentials: "omit" });
      if (!response.ok) throw new Error("Portfolio data unavailable");
      const profile = await response.json();
      const heroName = $("#hero-name");
      const nameLine = document.createTextNode(profile.name);
      const tagline = node("em", "", "Data, made useful.");
      heroName.replaceChildren(nameLine, document.createElement("br"), tagline);
      $("#hero-headline").textContent = profile.headline;
      $("#hero-location").textContent = profile.location;
      $("#hero-summary").textContent = profile.summary;
      $("#about-summary").textContent = profile.summary;
      $("#about-location").textContent = profile.location;
      if (profile.years_experience) $("#years-stat").textContent = profile.years_experience;
      renderExperience(profile.experience || []);
      renderProjects(profile.projects || []);
      renderSkills(profile.skills || []);
      renderAchievements(profile.achievements || []);
      renderEducation(profile.education || [], profile.certifications || []);
      const linkedin = profile.links?.find(item => item.label === "LinkedIn");
      const github = profile.links?.find(item => item.label === "GitHub");
      setExternalLink($("#linkedin-link"), linkedin);
      setExternalLink($("#contact-linkedin"), linkedin);
      setExternalLink($("#github-link"), github);
      observeReveals();
    } catch {
      showLoadError();
    }
  }

  document.addEventListener("DOMContentLoaded", init, { once: true });
})();
