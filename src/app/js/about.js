const LinkList = document.querySelectorAll(".links");
console.log({ LinkList });
LinkList.length > 0 &&
  [...LinkList].map((ele) => {
    ele.addEventListener("click", (e) => {
      var href = ele.attributes.href.value;
      Links.openLink(href);
      e.preventDefault();
    });
  });
