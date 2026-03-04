import React from "react";

function MyRouteGrid({ routeCards }) {
  return (
    <section className="my-route-grid">
      {routeCards.map((card) => (
        <article key={card.title} className="my-route-card">
          <div className="my-route-hero">📍</div>
          <div className="my-route-body">
            <h3>{card.title}</h3>
            <div className="my-route-tags">
              <span className={card.visibility === "공개" ? "open" : "private"}>{card.visibility}</span>
              <small>{card.date}</small>
            </div>
            <div className="my-route-metrics">
              <span>📍 {card.spots}</span>
              <span>🔖 {card.saves}</span>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export default MyRouteGrid;
