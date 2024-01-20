const noticeList = document.querySelector(".noticeList");
const spinner = document.querySelector(".spinner");

var issuesTaggedNotice = [
  {
    id: 0,
    title: "No Notice",
    body: "Currently we have no notices, check back later. OR, You may have issues due to github api rate limit",
  },
];
fetch("https://api.github.com/repos/dev-AshishRanjan/proxy-manager/issues")
  .then((req) => req.json())
  .then((res) => {
    console.log({ res });
    fireToast("Connected to github repo", "success");
    res.length > 0 &&
      res.map((ele) => {
        if (ele.labels.find((it) => it.name == "Notice")) {
          issuesTaggedNotice[0]?.id !== 0
            ? issuesTaggedNotice.push({ title: ele.title, body: ele.body })
            : (issuesTaggedNotice = [{ title: ele.title, body: ele.body }]);
        }
      });
    renderNotice();
  })
  .catch((err) => {
    fireToast(`Error connecting to github repo : ${err}`, "error");
    fireToast("Make sure you are connected to internet", "info");
  });

function renderNotice() {
  spinner.style.display = "none";
  if (issuesTaggedNotice.length > 0) {
    issuesTaggedNotice.map((ele) => {
      let cardDiv = document.createElement("details");
      cardDiv.classList.add("notice");
      let header = document.createElement("summary");
      header.innerText = ele.title;
      let description = document.createElement("p");
      description.innerHTML = ele.body;
      cardDiv.appendChild(header);
      cardDiv.appendChild(description);
      noticeList.appendChild(cardDiv);
    });
  }
}

function fireToast(message, type = info) {
  Toastify.toast({
    text: message,
    duration: 5000,
    className: `${type} toast`,
    close: false,
    stopOnFocus: true,
    gravity: "bottom", // `top` or `bottom`
    position: "left",
  });
}
