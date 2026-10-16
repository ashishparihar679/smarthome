// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://127.0.0.1:8000/",
// });

// export default API;

import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (
    import.meta.env.DEV
      ? "http://127.0.0.1:8000/"
      : "https://smarthome-d21v.onrender.com/"
  ),
});

export default API;
