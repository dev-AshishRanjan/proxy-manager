const proxyCards = document.querySelector(".proxyCards");
// const proxyList = localStorage.getItem("proxyList");
// const proxyListParsed = JSON.parse(proxyList);
var proxyListParsed = proxy.checkProxyList();
const noProxy = { title: "Remove Proxy" };
renderCard(noProxy);
proxyListParsed.map((ele) => {
  renderCard(ele);
});

function renderCard(ele) {
  let cardDiv = document.createElement("div");
  cardDiv.classList.add("card");
  let header = document.createElement("h3");
  header.innerText = ele.title;
  let proxyServer = document.createElement("p");
  proxyServer.innerHTML = `Proxy Server : <span>${ele.ipAddress}:${ele.port}</span>`;
  cardDiv.appendChild(header);
  ele.ipAddress && cardDiv.appendChild(proxyServer);
  ele.ipAddress
    ? cardDiv.addEventListener("click", () => handleProxyChange(ele))
    : cardDiv.addEventListener("click", () => handleProxyRemove());
  // cardDiv.classList.add("selected");
  proxy.checkCurrentProxy((proxy, error) => {
    if (error && ele.title === "Remove Proxy") {
      console.error(error);
      cardDiv.classList.add("selected");
      return;
    }
    else if (
      ele.ipAddress == proxy.split(":")[0] &&
      ele.port == proxy.split(":")[1]
    ) {
      cardDiv.classList.add("selected");
    }
  });
  proxyCards.appendChild(cardDiv);
}

function handleProxyChange(ele) {
  console.log({ ele });
  ipcRenderer.send("proxy:set", ele);
  // fireToast(ele.title, "info");
  // fireToast(ele.title, "success");
  // fireToast(ele.title, "error");

  // sendNotification({
  //   title: ele.title,
  //   body: ele.ipAddress,
  //   clickMessage: ele.id,
  // });
}
function handleProxyRemove() {
  ipcRenderer.send("proxy:unset", {});
}

function sendNotification({ title, body, clickMessage }) {
  const NOTIFICATION_TITLE = title;
  const NOTIFICATION_BODY = body;
  const CLICK_MESSAGE = clickMessage;

  new window.Notification(NOTIFICATION_TITLE, {
    body: NOTIFICATION_BODY,
  }).onclick = () => {
    document.getElementById("output").innerText = CLICK_MESSAGE;
  };
}

// checking CurrentProxy
// proxy.checkCurrentProxy((proxy, error) => {
//   if (error) {
//     console.error(error);
//     return;
//   }
//   console.log({ proxy });
// });

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

window.ipcRenderer.on("proxy:success", (e, options) => {
  console.log({ e });
  fireToast(e.msg, "success");
  setTimeout(() => {
    window.location.reload();
  }, 500);
});
window.ipcRenderer.on("proxy:error", (e, options) => {
  console.log({ e });
  fireToast(e.msg, "error");
  setTimeout(() => {
    window.location.reload();
  }, 500);
});
window.ipcRenderer.on("proxy:warning", (e, options) => {
  console.log({ e });
  fireToast(e.msg, "info");
  setTimeout(() => {
    window.location.reload();
  }, 500);
});
