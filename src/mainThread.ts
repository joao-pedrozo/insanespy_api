import fetch from "node-fetch";

const mainThread = () => {
  fetch("http://127.0.0.1:8000/store/add", {
    method: "POST",
    body: JSON.stringify({
      test: "test",
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
};

export default mainThread;
