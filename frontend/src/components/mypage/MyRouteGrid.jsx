import React from "react";
import { Bookmark, MapPin } from "lucide-react";

function MyRouteGrid({ routeCards }) {
  return (
    <section className="my-route-grid">
      {routeCards.map((card) => (
        <article key={card.title} className="my-route-card">
          <div className="my-route-hero">
            <MapPin size={74} strokeWidth={1.7} />
          </div>
          <div className="my-route-body">
            <h3>{card.title}</h3>
            <div className="my-route-tags">
              <span className={card.visibility === "공개" ? "open" : "private"}>{card.visibility}</span>
              <small>{card.date}</small>
            </div>
            <div className="my-route-metrics">
              <span>
                <MapPin size={12} strokeWidth={2.2} />
                {card.spots}
              </span>
              <span>
                <Bookmark size={12} strokeWidth={2.2} />
                {card.saves}
              </span>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export default MyRouteGrid;
