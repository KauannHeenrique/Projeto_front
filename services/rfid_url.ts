// services/rfid.ts

import axios from "axios";

const rfid = axios.create({
  baseURL: "http://192.168.1.87", // IP do módulo RFID
  timeout: 3000, // opcional: define um tempo limite de resposta
});

export default rfid;
