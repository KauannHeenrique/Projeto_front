// services/rfid.ts

import axios from "axios";

const rfid = axios.create({
  baseURL: "http://172.20.10.3", // IP do módulo RFID
  timeout: 3000, // opcional: define um tempo limite de resposta
});

export default rfid;
  