# A Word Becomes a Universe

An interactive data visualisation project that transforms a single keyword into a constellation of related ideas.

---

## Concept

This project explores the idea that knowledge is not linear, but relational.

When we use Wikipedia, we usually see a single page. However, every page is connected to many others through hyperlinks. Behind the surface of text lies a network of relationships.

This project makes that hidden structure visible.

By converting Wikipedia’s internal links into a dynamic constellation, the act of searching becomes a form of exploration. Instead of retrieving a single definition, the user navigates a universe of associations.

The structure reflects Deleuze and Guattari’s concept of the “rhizome” — a non-hierarchical network where any point can become a new beginning.

---

## How It Works

1. The user enters a keyword.
2. The server requests internal links from Wikipedia’s MediaWiki API.
3. The system generates nodes (concepts) and edges (relationships).
4. A force-based simulation creates a dynamic constellation layout.
5. The user can:
   - Hover to see connections
   - Drag nodes
   - Click a node to regenerate the universe
   - Press `S` to save the constellation as a PNG

---

## Technologies Used

- Node.js
- Express
- Wikipedia MediaWiki API
- p5.js (for visual rendering)

---

## Installation

Clone this repository:


https://github.com/m7vj6gkcj2-hue/A-Word-Becomes-a-Universe
