document.addEventListener("DOMContentLoaded", function () {
  var links = document.querySelectorAll("a[href]");

  links.forEach(function (link) {
    var href = link.getAttribute("href");

    if (!href || href.startsWith("#")) return;
    if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

    try {
      var url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    } catch (e) {
      // Ignore malformed URLs and leave link unchanged.
    }
  });
});
