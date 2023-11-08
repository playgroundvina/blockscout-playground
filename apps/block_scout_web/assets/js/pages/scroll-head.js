var prevScrollpos = document.documentElement.scrollTop;

document.addEventListener("DOMContentLoaded", (event) => {
    const headAlert = document.getElementById("head-scroll");
    const headAlertStyles = window.getComputedStyle(headAlert);
    const h = headAlertStyles.height;
    const main = document.getElementById("dependant-man");
    const mainStyles = window.getComputedStyle(main);
    const mainMarginTop = mainStyles.marginTop;
    main.style.marginTop = (parseInt(mainMarginTop) + parseInt(h) - 80) + "px";
});

window.onscroll = function () {
    var currentScrollPos = document.documentElement.scrollTop;
    const head = document.getElementById("head-scroll");
    const headStyles = window.getComputedStyle(head);
    const h = headStyles.height;
    if (prevScrollpos > currentScrollPos) {
        document.getElementById("head-scroll").style.top = "0";
    } else {
        if (currentScrollPos > parseInt(h)) document.getElementById("head-scroll").style.top = '-' + h;
    }
    prevScrollpos = currentScrollPos;
}