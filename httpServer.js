import http from "http";
import fs from "fs";
import path from "path";
import url from "url";
import queryString from "query-string";
import "dotenv/config";

const PORT = process.env.PORT;

const returnJson = (req, res, data) => {
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  res.writeHead(200, { "Content-Type": "application/json" });
  res.write(JSON.stringify(data));
  res.end();
};

const sendHTMLFile = (filePath, fileName, req, res) => {
  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  let htmlPath = path.join(__dirname, filePath, fileName);
  let fileStream = fs.createReadStream(htmlPath, "UTF-8");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
  res.writeHead(200, { "Content-Type": "text/html" });
  fileStream.pipe(res);
};

const sendCSSFile = (filePath, fileName, req, res) => {
  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  let cssPath = path.join(__dirname, filePath, fileName);
  let fileStream = fs.createReadStream(cssPath, "UTF-8");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
  res.writeHead(200, { "Content-Type": "text/css" });
  fileStream.pipe(res);
};

const sendJSFile = (filePath, fileName, req, res) => {
  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  let jsPath = path.join(__dirname, filePath, fileName);
  let fileStream = fs.createReadStream(jsPath, "UTF-8");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
  res.writeHead(200, { "Content-Type": "text/javascript" });
  fileStream.pipe(res);
};

const dataGetPost = (req, res) => {
  let data = {};
  let status = "SUCESSO";
  switch (req.method) {
    case "GET":
      let url_parts = url.parse(req.url, true);
      data = url_parts.query;
      break;
    case "POST":
      let body = "";
      req.on("data", function (data) {
        body += data;
        // Too much POST data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6) req.connection.destroy();
      });
      req.on("end", function () {
        data = queryString.parse(body);
      });
      break;
    default:
      break;
  }
  if (data) {
    if (
      !!!data.primeiroNome ||
      !!!data.ultimoNome ||
      !!!data.turma ||
      !!!data.email
    ) {
      returnJson(req, res, "Dados Incompleto ou Inconsistentes");
    } else {
      console.log(`${data.email} (${status})`);
      data.status = status;
      returnJson(req, res, data);
    }
  }
};

function app(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Request-Method", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");

  switch (req.url) {
    case req.url.match("/av01")?.input:
      dataGetPost(req, res);
      break;
    case req.url.match(/css$/)?.input:
      sendCSSFile("/css/", "styles.css", req, res);
      break;
    case req.url.match(/js$/)?.input:
      sendJSFile("/scripts/", "script.js", req, res);
      break;
    default:
      sendHTMLFile("/pages/", "404.html", req, res);
      break;
  }
}

http.createServer(app).listen(PORT);
