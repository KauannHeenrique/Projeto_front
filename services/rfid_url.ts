// services/rfid.ts

import axios from "axios";

const rfid = axios.create({
  baseURL: "http://172.20.10.3", // IP do módulo RFID
});

export default rfid;
  