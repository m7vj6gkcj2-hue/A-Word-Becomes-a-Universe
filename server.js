const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/constellation', async (req, res) => {
  const keyword = (req.query.keyword || '').trim();

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required.' });
  }

  try {
    const data = await fetchConstellationData(keyword);
    res.json(data);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({
      error: 'Failed to fetch Wikipedia data.'
    });
  }
});

async function fetchWikipediaLinks(title, limit = 24) {
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'links',
    pllimit: String(limit),
    plnamespace: '0',
    format: 'json',
    origin: '*',
    redirects: '1'
  });

  const url = `https://en.wikipedia.org/w/api.php?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Wikipedia API responded with ${response.status}`);
  }

  const json = await response.json();
  const pages = json?.query?.pages || {};
  const page = Object.values(pages)[0];

  if (!page || page.missing !== undefined) {
    return {
      resolvedTitle: title,
      links: []
    };
  }

  const resolvedTitle = page.title;
  const links = (page.links || [])
    .map(item => item.title)
    .filter(Boolean)
    .filter(link => link !== resolvedTitle)
    .slice(0, limit);

  return { resolvedTitle, links };
}

async function fetchConstellationData(keyword) {
  const { resolvedTitle, links } = await fetchWikipediaLinks(keyword, 24);

  const nodesMap = new Map();
  const edgeSet = new Set();
  const linksArray = [];

  nodesMap.set(resolvedTitle, {
    id: resolvedTitle,
    isRoot: true
  });

  for (const link of links) {
    if (!nodesMap.has(link)) {
      nodesMap.set(link, {
        id: link,
        isRoot: false
      });
    }

    const edgeKey = `${resolvedTitle}|${link}`;
    if (!edgeSet.has(edgeKey)) {
      edgeSet.add(edgeKey);
      linksArray.push({
        source: resolvedTitle,
        target: link
      });
    }
  }

  return {
    keyword,
    root: resolvedTitle,
    nodeCount: nodesMap.size,
    linkCount: linksArray.length,
    nodes: Array.from(nodesMap.values()),
    links: linksArray
  };
}

app.listen(PORT, () => {
  console.log(`Wikipedia Constellation server running at http://localhost:${PORT}`);
});