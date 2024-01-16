// custom page
const customForm = document.querySelector(".custom");
const namet = document.querySelector(".custom>.name");
const email = document.querySelector(".custom>.email");
const subject = document.querySelector(".custom>.subject");
const msg = document.querySelector(".custom>.msg");
const btn = document.querySelector(".custom>.btn");

btn &&
  btn.addEventListener("click", () => {
    handleSubmission();
  });
const handleSubmission = async (e) => {
  console.log("form submitted");

  // e.preventDefault();
  const sendform = {
    name: namet.value,
    email: email.value,
    subject: subject.value,
    message: msg.value,
  };
  fetch(`https://submit-form.com/5kKhpqZtL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(sendform),
  })
    .then(function (response) {
      console.log(response);
      response.status !== 200
        ? fireToast(`error sending mail: ${response.status}`, "error")
        : fireToast(`email sent sussessfully`, "success");
    })
    .catch(function (error) {
      console.error(error);
      fireToast(`error sendinge mail : ${error.status}`, "error");
    });

  namet.value = "";
  email.value = "";
  subject.value = "";
  msg.value = "";
};

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
