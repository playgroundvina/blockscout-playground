var prevScrollpos = window.pageYOffset || document.documentElement.scrollTop;
window.onscroll = function () {
    var currentScrollPos = window.pageYOffset || document.documentElement.scrollTop;
    console.log("vvv")
    console.log(currentScrollPos)
    if (prevScrollpos > currentScrollPos) {
        document.getElementById("top-navbar").style.top = "0";
    } else {
        document.getElementById("top-navbar").style.top = "-80px";
    }
    prevScrollpos = currentScrollPos;
}