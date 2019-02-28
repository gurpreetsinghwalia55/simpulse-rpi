const fs = require('fs');
const mqtt = require('mqtt');
const jwt = require('jsonwebtoken');

function createJwt(projectId, privateKeyFile, algorithm) {
    const token = {
        iat: parseInt(Date.now() / 1000),
        exp: parseInt(Date.now() / 1000) + 20 * 60,
        aud: projectId
    };
    const privateKey = fs.readFileSync(privateKeyFile);
    return jwt.sign(token, privateKey, { algorithm: algorithm });
}

const projectId = 'simpulse';
const cloudRegion = 'us-central1';
const registryId = 'col-asia-reg';
const deviceId = 'col-asia-dev-1';
const privateKeyFile = './rsa_private.pem';
const algorithm = 'RS256'; 

const mqttClientId = `projects/${projectId}/locations/${
    cloudRegion
  }/registries/${registryId}/devices/${deviceId}`;  

let connectionArgs = {
    host: 'mqtt.googleapis.com',
    port: 8883,
    clientId: mqttClientId,
    username: 'unused',
    password: createJwt(projectId, privateKeyFile, algorithm),
    protocol: 'mqtts',
    secureProtocol: 'TLSv1_2_method',
};

let client = mqtt.connect(connectionArgs);

const mqttTopic = `/devices/${deviceId}/events`;

function getRandomNumber() {
    var max = 10;
    var min = 1;
    return parseInt(Math.random() * (+max - +min) + +min);
}

setInterval(() => {
    const payload = JSON.stringify({ "number": getRandomNumber() });
    console.log('Publishing message: ' + payload);
    client.publish(mqttTopic, payload, {qos: 1}, (err) => {if (err) console.log(err)})
}, 5000);