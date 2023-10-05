function toggleNav() {
    // Refresh page when window is resized
    window.addEventListener('resize', function() {
        window.location.reload();
    });
    
    if (window.matchMedia("(min-width: 769px)").matches) {
        const nav = document.getElementById("collapsibleNavbar");
        const navHeader = document.getElementsByClassName("header-text")[0];
        const topBar = document.getElementsByClassName("top-bar")[0];
        const main = document.getElementsByTagName("main")[0];
        const headerTextDisplayStyle = window.getComputedStyle(navHeader).getPropertyValue("display");
        const isNavOpen = nav.classList.contains("navOpen");

        if (headerTextDisplayStyle !== "block") {
            nav.classList.add("navOpen");
            document.querySelectorAll(".nav-text").forEach(function(text) {
                text.style.display = 'block';
            });
            navHeader.style.display = 'block';
            nav.style.width = "14rem";
            topBar.style.paddingRight = "15rem";
            main.style.marginLeft = "14rem";
        } else {
            nav.classList.remove("navOpen");
            document.querySelectorAll(".nav-text").forEach(function(text) {
                text.style.display = 'none';
            });
            navHeader.style.display = 'none';
            nav.style.width = "4.5rem";
            topBar.style.paddingRight = "5.5rem";
            main.style.marginLeft = "4.5rem";
        }
    } else {
        const nav = document.getElementById("collapsibleNavbar");
        const navDisplayStyle = window.getComputedStyle(nav).getPropertyValue("display");
        const menu = document.getElementsByClassName("menu-bar")[0];

        if (navDisplayStyle !== "flex") {
            nav.style.width = "100%";
            nav.style.display = "flex";
            menu.style.width = "100%"; 
        } else {
            nav.style.display = 'none';
        }
    }
}