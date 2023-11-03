var prevScrollpos = document.documentElement.scrollTop;

document.addEventListener("DOMContentLoaded", (event) => {
    const headAlert = document.getElementById("head-scroll");
    const headAlertStyles = window.getComputedStyle(headAlert);
    const h = headAlertStyles.height;
    const main = document.getElementById("dependant-man");
    const mainStyles = window.getComputedStyle(main);
    const mainMarginTop = mainStyles.marginTop;
    console.log("DOMContentLoaded")
    console.log(h)
    console.log(mainMarginTop)
    console.log((parseInt(mainMarginTop) + parseInt(h) - 80) + "px")
    main.style.marginTop = (parseInt(mainMarginTop) + parseInt(h) - 80) + "px";
});

window.onscroll = function () {
    var currentScrollPos = document.documentElement.scrollTop;
    const headAlert = document.getElementById("head-scroll");
    const headAlertStyles = window.getComputedStyle(headAlert);
    const h = headAlertStyles.height;
    if (prevScrollpos > currentScrollPos) {
        document.getElementById("head-scroll").style.top = "0";
    } else {
        console.log('-' + h)
        document.getElementById("head-scroll").style.top = '-' + h;
    }
    prevScrollpos = currentScrollPos;
}