let graph = { nodes: [], links: [], root: null };
let simNodes = [];
let simLinks = [];
let idToNode = new Map();
let adjacency = new Map();

let hoveredId = null;
let draggedNode = null;
let lastKeyword = "constellation";
let rootId = null;
let time = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(2, 4, 10);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

window.setGraphData = (data, keyword) => {
  graph = data;
  lastKeyword = (keyword || "constellation").trim() || "constellation";
  rootId = data.root || null;

  idToNode = new Map();
  adjacency = new Map();
  hoveredId = null;
  draggedNode = null;

  simNodes = graph.nodes.map((n, i) => {
    const angle = map(i, 0, Math.max(1, graph.nodes.length), 0, TWO_PI);
    const radius = random(40, min(width, height) * 0.22);

    const x = width / 2 + cos(angle) * radius + random(-30, 30);
    const y = height / 2 + sin(angle) * radius + random(-30, 30);

    const obj = {
      id: n.id,
      isRoot: !!n.isRoot || n.id === rootId,
      x,
      y,
      vx: 0,
      vy: 0,
      deg: 0
    };

    idToNode.set(n.id, obj);
    adjacency.set(n.id, new Set());
    return obj;
  });

  simLinks = graph.links
    .map(l => ({ a: idToNode.get(l.source), b: idToNode.get(l.target) }))
    .filter(e => e.a && e.b);

  for (const e of simLinks) {
    e.a.deg++;
    e.b.deg++;
    adjacency.get(e.a.id).add(e.b.id);
    adjacency.get(e.b.id).add(e.a.id);
  }

  updateInfoPanel();
};

function draw() {
  background(2, 4, 10, 70);
  drawBackgroundStars();

  time += 0.01;

  if (simNodes.length === 0) {
    noStroke();
    fill(255, 90);
    circle(width / 2, height / 2, 4);
    return;
  }

  runSimulation();
  hoveredId = pickHoveredNodeId(mouseX, mouseY);
  drawLinks();
  drawNodes();
  updateInfoPanel();
}

function runSimulation() {
  for (let i = 0; i < simNodes.length; i++) {
    for (let j = i + 1; j < simNodes.length; j++) {
      const a = simNodes[i];
      const b = simNodes[j];

      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d2 = dx * dx + dy * dy + 0.01;

      const force = 1200 / d2;
      a.vx += dx * force;
      a.vy += dy * force;
      b.vx -= dx * force;
      b.vy -= dy * force;
    }
  }

  for (const e of simLinks) {
    const a = e.a;
    const b = e.b;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const d = Math.sqrt(dx * dx + dy * dy) + 0.001;

    const target = a.isRoot || b.isRoot ? 150 : 105;
    const k = 0.003;
    const f = (d - target) * k;

    const fx = (dx / d) * f;
    const fy = (dy / d) * f;

    a.vx += fx;
    a.vy += fy;
    b.vx -= fx;
    b.vy -= fy;
  }

  for (const n of simNodes) {
    if (draggedNode && draggedNode.id === n.id) {
      n.x = mouseX;
      n.y = mouseY;
      n.vx = 0;
      n.vy = 0;
      continue;
    }

    if (n.isRoot) {
      const cx = width / 2;
      const cy = height / 2;
      n.vx += (cx - n.x) * 0.0009;
      n.vy += (cy - n.y) * 0.0009;
    }

    n.vx *= 0.88;
    n.vy *= 0.88;
    n.x += n.vx;
    n.y += n.vy;

    n.x = constrain(n.x, 50, width - 50);
    n.y = constrain(n.y, 50, height - 50);
  }
}

function drawBackgroundStars() {
  noStroke();
  for (let i = 0; i < 35; i++) {
    const x = (i * 197.13) % width;
    const y = (i * 113.71) % height;
    const alpha = 35 + 25 * sin(time + i);
    fill(255, alpha);
    circle(x, y, 1.5);
  }
}

function drawLinks() {
  strokeWeight(1);

  for (const e of simLinks) {
    const a = e.a;
    const b = e.b;
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let alpha = constrain(map(dist, 0, 400, 170, 22), 10, 120);

    if (hoveredId) {
      const highlight =
        a.id === hoveredId ||
        b.id === hoveredId ||
        adjacency.get(hoveredId)?.has(a.id) ||
        adjacency.get(hoveredId)?.has(b.id);

      alpha = highlight ? 210 : 10;
    }

    stroke(255, alpha);
    line(a.x, a.y, b.x, b.y);
  }
}

function drawNodes() {
  for (const n of simNodes) {
    const isHovered = hoveredId === n.id;
    const isNeighbor = hoveredId && adjacency.get(hoveredId)?.has(n.id);

    const base = n.isRoot ? 11 : 4 + Math.min(10, n.deg * 0.45);
    const pulse = Math.sin(time * 2.2 + n.deg) * 0.9;

    let coreSize = base + pulse;
    let coreAlpha = n.isRoot ? 255 : 190;
    let glowSize = base + 12 + pulse * 1.8;
    let glowAlpha = n.isRoot ? 38 : 18;
    let labelAlpha = 0;

    if (isHovered) {
      coreSize *= 1.65;
      glowSize *= 1.45;
      coreAlpha = 255;
      glowAlpha = 65;
      labelAlpha = 255;
    } else if (isNeighbor) {
      coreAlpha = 220;
      glowAlpha = 34;
      labelAlpha = 150;
    } else if (hoveredId) {
      coreAlpha = 75;
      glowAlpha = 8;
    }

    noStroke();
    for (let k = 3; k >= 1; k--) {
      const s = glowSize * (k / 3);
      fill(255, glowAlpha * (k / 3));
      circle(n.x, n.y, s);
    }

    fill(255, coreAlpha);
    circle(n.x, n.y, max(2, coreSize));

    if (isHovered || n.isRoot) {
      fill(255, n.isRoot ? 210 : labelAlpha);
      textAlign(CENTER, BOTTOM);
      textSize(n.isRoot ? 16 : 12);
      text(n.id, n.x, n.y - 12);
    }
  }
}

function pickHoveredNodeId(mx, my) {
  let best = null;
  let bestD = Infinity;

  for (const n of simNodes) {
    const dx = mx - n.x;
    const dy = my - n.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    const hitR = n.isRoot ? 20 : 11 + Math.min(10, n.deg * 0.18);
    if (d < hitR && d < bestD) {
      bestD = d;
      best = n.id;
    }
  }

  return best;
}

function mousePressed() {
  for (const n of simNodes) {
    const d = dist(mouseX, mouseY, n.x, n.y);
    const hitR = n.isRoot ? 20 : 12 + Math.min(10, n.deg * 0.18);
    if (d < hitR) {
      draggedNode = n;
      return;
    }
  }
}

function mouseReleased() {
  if (draggedNode) {
    const releasedNode = draggedNode;
    draggedNode = null;

    const d = dist(mouseX, mouseY, releasedNode.x, releasedNode.y);
    if (d < 10 && window.loadKeyword) {
      window.loadKeyword(releasedNode.id);
    }
  }
}

function updateInfoPanel() {
  const hoveredWord = document.getElementById("hoveredWord");
  const connections = document.getElementById("connections");
  const status = document.getElementById("status");

  if (!hoveredWord || !connections || !status) return;

  if (!hoveredId) {
    hoveredWord.textContent = "—";
    connections.textContent = "—";
    return;
  }

  const neighborCount = adjacency.get(hoveredId)?.size ?? 0;
  hoveredWord.textContent = hoveredId;
  connections.textContent = String(neighborCount);

  const lines = status.textContent.split("\n").slice(0, 2).join("\n");
  status.textContent =
    `${lines}\n\nhover: ${hoveredId}\nconnections: ${neighborCount}\nclick to explore • drag to move • press S to save`;
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    const safeKw = lastKeyword
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_\-]/g, "");

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const name = `constellation_${safeKw}_${stamp}`;
    saveCanvas(name, "png");
  }
}