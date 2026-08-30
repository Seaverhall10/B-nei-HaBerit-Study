import os

css_content = """/* Slide Deck Presentation Mode Styles */
:root {
  --deck-bg: #0c1a19;
  --deck-surface: #132b28;
  --deck-card: #193834;
  --deck-border: #2c5952;
  --deck-ink: #f7f5ee;
  --deck-muted: #a3c2ba;
  --deck-gold: #e7c56a;
  --deck-gold-dim: #c9a24a;
  --deck-callout: #234d47;
}

body.deck-mode {
  margin: 0;
  padding: 0;
  background: var(--deck-bg);
  color: var(--deck-ink);
  font-family: "EB Garamond", Georgia, serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.deck-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: rgba(12, 26, 25, 0.95);
  border-bottom: 1px solid var(--deck-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.deck-nav-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.deck-title-badge {
  font-family: Arial, sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--deck-gold);
}

.deck-select {
  background: var(--deck-surface);
  color: var(--deck-ink);
  border: 1px solid var(--deck-border);
  padding: 6px 12px;
  border-radius: 6px;
  font-family: Arial, sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
}

.deck-btn {
  background: var(--deck-surface);
  color: var(--deck-ink);
  border: 1px solid var(--deck-border);
  padding: 6px 14px;
  border-radius: 6px;
  font-family: Arial, sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.deck-btn:hover {
  background: var(--deck-card);
  border-color: var(--deck-gold);
  color: var(--deck-gold);
}

.deck-btn.primary {
  background: var(--deck-gold-dim);
  color: #0c1a19;
  border-color: var(--deck-gold);
}

.deck-btn.primary:hover {
  background: var(--deck-gold);
}

.deck-stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.deck-slide {
  background: var(--deck-surface);
  border: 1px solid var(--deck-border);
  border-radius: 14px;
  padding: 40px;
  width: 100%;
  min-height: 520px;
  box-sizing: border-box;
  box-shadow: 0 12px 36px rgba(0,0,0,0.45);
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation: slideFade 0.22s ease-out;
}

@keyframes slideFade {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.deck-slide .kicker {
  font-family: Arial, sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--deck-gold);
  margin-bottom: 8px;
}

.deck-slide h1 {
  font-size: clamp(2rem, 4.5vw, 3.4rem);
  line-height: 1.12;
  margin: 0 0 14px;
  color: #fff;
  font-family: Arial, sans-serif;
}

.deck-slide h2 {
  font-size: clamp(1.6rem, 3.2vw, 2.3rem);
  line-height: 1.2;
  margin: 0 0 8px;
  color: #fff;
  font-family: Arial, sans-serif;
}

.deck-slide .sub {
  font-size: 1.15rem;
  color: var(--deck-muted);
  margin-bottom: 24px;
}

.deck-callout {
  background: var(--deck-callout);
  border-left: 4px solid var(--deck-gold);
  padding: 16px 20px;
  border-radius: 0 8px 8px 0;
  font-size: 1.25rem;
  line-height: 1.45;
  margin-top: 20px;
}

.deck-words-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.deck-word-card {
  background: var(--deck-card);
  border: 1px solid var(--deck-border);
  border-radius: 10px;
  padding: 18px;
}

.deck-word-card .he {
  font-family: "SBL Hebrew", "David", "Times New Roman", serif;
  font-size: 2rem;
  direction: rtl;
  color: #fff;
  margin-bottom: 4px;
}

.deck-word-card .tr {
  font-family: Arial, sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--deck-gold);
  margin-bottom: 8px;
}

.deck-word-card .def {
  font-size: 1.02rem;
  line-height: 1.4;
  color: var(--deck-ink);
}

.deck-split-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 16px;
}

.deck-contrast-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 16px;
}

.deck-pane {
  background: var(--deck-card);
  border: 1px solid var(--deck-border);
  border-radius: 10px;
  padding: 22px;
}

.deck-pane h3 {
  font-family: Arial, sans-serif;
  font-size: 1.18rem;
  color: var(--deck-gold);
  margin-top: 0;
  margin-bottom: 12px;
}

.deck-pane ul {
  padding-left: 20px;
  margin: 0;
}

.deck-pane li {
  font-size: 1.08rem;
  line-height: 1.5;
  margin-bottom: 10px;
}

.deck-map-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
  margin-top: 12px;
}

.deck-map-item {
  background: var(--deck-card);
  border: 1px solid var(--deck-border);
  border-radius: 8px;
  padding: 16px;
  transition: transform 0.12s ease, border-color 0.12s ease;
}

.deck-map-item:hover {
  transform: translateY(-2px);
  border-color: var(--deck-gold);
}

.deck-map-item .name {
  font-family: Arial, sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  color: #fff;
}

.deck-map-item .tag {
  display: inline-block;
  font-family: Arial, sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--deck-gold);
  margin: 4px 0 8px;
}

.deck-map-item .text {
  font-size: 0.98rem;
  line-height: 1.45;
  color: var(--deck-ink);
}

.deck-bullets {
  padding-left: 24px;
  font-size: 1.18rem;
  line-height: 1.55;
}

.deck-bullets li {
  margin-bottom: 14px;
}

blockquote {
  margin: 0 0 18px;
  padding: 14px 20px;
  background: var(--deck-card);
  border-left: 4px solid var(--deck-gold);
  font-style: italic;
  font-size: 1.25rem;
  line-height: 1.5;
}

.deck-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px 20px;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.deck-dots {
  display: flex;
  gap: 8px;
  align-items: center;
}

.deck-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--deck-border);
  cursor: pointer;
  transition: all 0.15s ease;
}

.deck-dot.active {
  background: var(--deck-gold);
  transform: scale(1.3);
}

.deck-counter {
  font-family: Arial, sans-serif;
  font-size: 0.88rem;
  color: var(--deck-muted);
}

@media (max-width: 768px) {
  .deck-slide {
    padding: 24px 18px;
    min-height: auto;
  }
  .deck-split-grid,
  .deck-contrast-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .deck-words-grid {
    grid-template-columns: 1fr;
  }
  .deck-header {
    padding: 10px 14px;
  }
}
"""

for d in ['public', 'docs']:
    with open(os.path.join(d, 'deck.css'), 'w', encoding='utf-8') as f:
        f.write(css_content)
print('Generated deck.css successfully')
