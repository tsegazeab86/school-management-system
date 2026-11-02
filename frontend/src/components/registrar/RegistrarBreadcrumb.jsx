import React from "react";
import { Home, ChevronRight } from "lucide-react";

import "../../styles/registrar/RegistrarBreadcrumb.css";

function RegistrarBreadcrumb({
    items = [],
    onNavigate = () => {},
}) {
    return (
        <nav className="registrar-breadcrumb" aria-label="Breadcrumb">

            <button
                type="button"
                className="breadcrumb-home"
                onClick={() => onNavigate("dashboard")}
                title="Go to Dashboard"
            >
                <Home size={17} />
                <span>Home</span>
            </button>

            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <React.Fragment key={`${item.label}-${index}`}>
                        <ChevronRight
                            size={16}
                            className="breadcrumb-separator"
                        />

                        <button
                            type="button"
                            className={`breadcrumb-item ${
                                isLast ? "active" : ""
                            }`}
                            disabled={isLast}
                            onClick={() => onNavigate(item.key)}
                        >
                            {item.label}
                        </button>
                    </React.Fragment>
                );
            })}

        </nav>
    );
}

export default RegistrarBreadcrumb;