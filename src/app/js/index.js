const proxyCards = document.querySelector(".proxyCards");
const spinner = document.querySelector(".spinner");
// const proxyList = localStorage.getItem("proxyList");
// const proxyListParsed = JSON.parse(proxyList);

var currentProxy;
spinner.style.display = "block";
// ipcRenderer.send("proxy:check");
function initialRenderMainWindow() {
  spinner.style.display = "block";
  var proxyListParsed = proxy.checkProxyList();
  const noProxy = { title: "Remove Proxy" };
  renderCard(noProxy);
  // spinner.style.display = "none";
  proxyListParsed.map((ele) => {
    renderCard(ele);
  });
}

function reRenderMainWindow() {
  spinner.style.display = "block";
  var proxyListParsed = proxy.checkProxyList();
  const noProxy = { title: "Remove Proxy" };
  proxyCards ? (proxyCards.innerHTML = "") : null;
  renderCard(noProxy);
  proxyListParsed.map((ele) => {
    renderCard(ele);
  });
  // ipcRenderer.send("proxy:check");
  const vars = document.querySelectorAll(".card");
  console.log({ vars });
}

initialRenderMainWindow();
// reRenderMainWindow();

function renderCard(ele) {
  spinner.style.display = "block";
  let cardDiv = document.createElement("div");
  cardDiv.classList.add("card");
  cardDiv.setAttribute("title", "click to set this proxy");
  let header = document.createElement("h3");
  header.innerText = ele.title;
  let proxyServer = document.createElement("p");
  proxyServer.innerHTML = `Proxy Server : <span>${ele.ipAddress}:${ele.port}</span>`;
  cardDiv.appendChild(header);
  let close = document.createElement("p");
  close.classList.add("close");
  close.innerHTML = `<span>x</span>`;
  close.setAttribute("title", "click to delete this proxy");
  ele.ipAddress && cardDiv.appendChild(close);
  ele.id &&
    close.addEventListener("click", (e) => {
      proxy.proxyListDelete(ele.id);
      reRenderMainWindow();
      fireToast("Removed from localstorage", "success");
      e.stopPropagation();
    });
  ele.ipAddress && cardDiv.appendChild(proxyServer);
  ele.ipAddress
    ? cardDiv.addEventListener("click", () => handleProxyChange(ele))
    : cardDiv.addEventListener("click", () => handleProxyRemove());
  // cardDiv.classList.add("selected");
  proxy.checkCurrentProxy((proxy, error) => {
    if ((proxy === undefined || error) && ele.title === "Remove Proxy") {
      console.error(error);
      cardDiv.classList.add("selected");
      const ripple = document.createElement("span");
      ripple.classList.add("ripple");
      // ripple.innerText="✔️"
      cardDiv.appendChild(ripple);
      return;
    } else if (
      ele.ipAddress == proxy.split(":")[0] &&
      ele.port == proxy.split(":")[1]
    ) {
      cardDiv.classList.add("selected");
      const ripple = document.createElement("span");
      ripple.classList.add("ripple");
      // ripple.innerText="✔️"
      cardDiv.appendChild(ripple);
    }
  });
  proxyCards && proxyCards.appendChild(cardDiv);
  spinner.style.display = "none";
}

function handleProxyChange(ele) {
  spinner.style.display = "block";
  console.log({ ele });
  ipcRenderer.send("proxy:set", ele);
}

// sendNotification({
//   title: ele.title,
//   body: ele.ipAddress,
//   clickMessage: ele.id,
// });

function handleProxyRemove() {
  spinner.style.display = "block";
  proxy.checkCurrentProxy((proxy, error) => {
    if (error) {
      fireToast("Proxy already removed", "info");
      return;
    } else if (proxy === undefined) {
      fireToast("Proxy already removed", "info");
      return;
    } else {
      ipcRenderer.send("proxy:unset", {});
    }
  });
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
  spinner.style.display = "block";
  console.log({ e });
  fireToast(e.msg, "success");
  setTimeout(() => {
    reRenderMainWindow();
  }, 650);
});
window.ipcRenderer.on("proxy:error", (e, options) => {
  spinner.style.display = "block";
  console.log({ e });
  fireToast(e.msg, "error");
  // setTimeout(() => {
  //   reRenderMainWindow();
  // }, 600);
});
window.ipcRenderer.on("proxy:warning", (e, options) => {
  spinner.style.display = "block";
  console.log({ e });
  fireToast(e.msg, "info");
  // reRenderMainWindow();
});
window.ipcRenderer.on("proxy:check:error", (e, options) => {
  console.log({ e });
  fireToast(e.msg, "error");
});
window.ipcRenderer.on("proxy:check:success", (e, options) => {
  console.log({ e });
  currentProxy = e.proxy;
  fireToast(e.msg, "success");
});
window.ipcRenderer.on("form-accepted", (e, options) => {
  console.log({ e });
  fireToast(e.msg, "info");
  reRenderMainWindow();
});
