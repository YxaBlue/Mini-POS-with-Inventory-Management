export function renderSidebar(activePage = "inventory") {
    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: "ti-layout-dashboard" },
        { id: "inventory", label: "Inventory", icon: "ti-package"          },
        { id: "pos",       label: "POS",       icon: "ti-shopping-cart"    },
        { id: "sales",     label: "Sales",     icon: "ti-receipt"          },
    ];

    const nav = navItems.map(item => `
        <a
            href="../${item.id}/${item.id}.html"
            class="nav-item ${item.id === activePage ? "active" : ""}"
        >
            <i class="ti ${item.icon}" aria-hidden="true"></i>
            <span class="nav-label">${item.label}</span>
        </a>
    `).join("");

    return `
        <div id="sidebar-root">
            <button id="sidebar-hamburger" class="sidebar-hamburger" aria-label="Open menu">
                <i class="ti ti-menu-2" aria-hidden="true"></i>
            </button>

            <div id="sidebar-backdrop" class="sidebar-backdrop"></div>

            <aside class="sidebar" id="sidebar">
                <div class="sidebar-logo" id="sidebar-logo">
                    <div class="logo-mark">
                        <div class="logo-icon">
                            <i class="ti ti-device-desktop-analytics" aria-hidden="true"></i>
                        </div>
                        <div class="logo-text-group">
                            <div class="logo-text">MiniPOS</div>
                            <div class="logo-sub">Point of Sale</div>
                        </div>
                    </div>
                </div>
                <nav class="nav">${nav}</nav>
            </aside>
        </div>
    `;
}

export function initSidebar() {
    const sidebar = document.getElementById("sidebar");
    const hamburger = document.getElementById("sidebar-hamburger");
    const backdrop = document.getElementById("sidebar-backdrop");
    const logo = document.getElementById("sidebar-logo");

    function isMobile() {
        return window.matchMedia("(max-width: 768px)").matches;
    }

    // ===== DESKTOP: expand/collapse via logo click =====
    function setCollapsed(collapsed) {
        document.body.classList.toggle("sidebar-collapsed", collapsed);
    }

    // ===== MOBILE: open/close drawer via hamburger =====
    function openMobile() {
        sidebar.classList.add("mobile-open");
        backdrop.classList.add("active");
    }
    function closeMobile() {
        sidebar.classList.remove("mobile-open");
        backdrop.classList.remove("active");
    }

    hamburger.addEventListener("click", openMobile);
    backdrop.addEventListener("click", closeMobile);

    // Logo click: behavior depends on device width
    logo.addEventListener("click", () => {
        if (isMobile()) {
            closeMobile();
        } else {
            setCollapsed(!document.body.classList.contains("sidebar-collapsed"));
        }
    });

    // Click outside the sidebar closes it (desktop collapse OR mobile drawer)
    document.addEventListener("click", (e) => {
        const clickedInsideSidebar = sidebar.contains(e.target);
        const clickedHamburger = hamburger.contains(e.target);
        if (clickedInsideSidebar || clickedHamburger) return;

        if (isMobile()) {
            closeMobile();
        } else if (!document.body.classList.contains("sidebar-collapsed")) {
            setCollapsed(true);
        }
    });

    // Nav link click: close mobile drawer (keep desktop state as-is)
    sidebar.querySelectorAll(".nav-item").forEach(link => {
        link.addEventListener("click", () => {
            if (isMobile()) closeMobile();
        });
    });
}