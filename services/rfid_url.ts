// services/rfid.ts

import axios from "axios";

const rfid = axios.create({
  baseURL: "http://10.210.230.43", // IP do módulo RFID
});

export default rfid;
  