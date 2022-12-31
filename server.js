/**
 * @author pschroen / https://ufo.ai/
 *
 * Remix of https://glitch.com/edit/#!/multiuser-sketchpad
 */

import express from 'express';
const app = express();

import enableWs from 'express-ws';
const expressWs = enableWs(app);
expressWs.getWss('/');

const interval = 4000; // 4 second heartbeat

app.use(express.static('public'));

//

const clients = [];
const room = new Array(255);

function getRemoteAddress(request) {
  return (request.headers['x-forwarded-for'] || request.connection.remoteAddress).split(',')[0].trim();
}

function getRemoteAddresses() {
  return clients.map(ws => ws._remoteAddress);
}

function getUsers() {
  if (!clients.length) {
    return;
  }

  const length = clients.length;
  const byteLength = 1 + 10 + 4 + 2;
  const data = Buffer.allocUnsafe(1 + byteLength * length);
  data.writeUInt8(0, 0);

  let index = 1;

  for (let i = 0; i < length; i++) {
    const client = clients[i];

    data.writeUInt8(client._id, index);

    const buf = Buffer.from(client._nickname, 'utf8');

    for (let j = 0; j < 10; j++) {
      data.writeUInt8(buf[j], index + 1 + j);
    }

    data.writeUInt32BE(ip2long(client._remoteAddress), index + 11);
    data.writeUInt16BE(client._latency, index + 15);

    index += byteLength;
  }

  // console.log('USERS:', data);

  return data;
}

function add(ws, request) {
  clients.push(ws);

  for (let i = 0, l = room.length; i < l; i++) {
    if (room[i] === undefined) {
      const remoteAddresses = getRemoteAddresses();

      let count = 1;
      let remoteAddress = getRemoteAddress(request);

      while (remoteAddresses.includes(remoteAddress)) {
        count++;
        remoteAddress = `${getRemoteAddress(request)} (${count})`;
      }

      ws._id = i;
      ws._idle = Date.now();
      ws._nickname = '';
      ws._remoteAddress = remoteAddress;
      ws._latency;

      room[i] = ws;

      return;
    }
  }
}

function remove(ws) {
  let index = clients.indexOf(ws);

  if (~index) {
    clients.splice(index, 1);
  }

  index = room.indexOf(ws);

  if (~index) {
    room[index] = undefined;
  }
}

function broadcast(ws, data) {
  for (let i = 0, l = clients.length; i < l; i++) {
    const client = clients[i];

    if (client !== ws && client.readyState === client.OPEN) {
      client.send(data);
    }
  }
}

function users(ws) {
  broadcast(ws, getUsers());
}

app.ws('/', (ws, request) => {
  add(ws, request);

  console.log('USERS:', clients.length);

  ws.on('close', () => {
    remove(ws);
    users(ws);

    console.log('USERS:', clients.length);
  });

  ws.on('message', data => {
    ws._idle = 0;

    data.writeUInt8(ws._id, 1);

    switch (data.readUInt8(0)) {
      case 1:
        ws._latency = Math.min(65535, Date.now() - Number(data.readBigUInt64BE(2))); // Clamp to 65535
        break;
      case 2:
        ws._nickname = Buffer.from(data.subarray(2), 'utf-8').toString();
        users(ws);
        break;
      case 3:
        broadcast(ws, data);
    }

    // console.log('MESSAGE:', data);
  });

  const heartbeat = () => {
    if (ws.readyState === ws.OPEN) {
      const data = Buffer.allocUnsafe(10);
      data.writeUInt8(1, 0);
      data.writeUInt8(ws._id, 1);
      data.writeBigUInt64BE(BigInt(Date.now()), 2);

      ws.send(data);

      setTimeout(heartbeat, interval);
    }
  };

  heartbeat();
  users();
});

setInterval(() => {
  const idleTime = Date.now() - 1800000; // 30 * 60 * 1000

  for (let i = 0, l = clients.length; i < l; i++) {
    const client = clients[i];

    if (client._idle === 0) {
      client._idle = Date.now();
    } else if (client._idle < idleTime) {
      client.terminate();
      console.log('IDLE:', client._id);
    }
  }

  users();
}, interval);

//

const listener = app.listen(process.env.PORT, '0.0.0.0', () => {
  console.log(`Listening on port ${listener.address().port}`);
});

// https://stackoverflow.com/questions/1908492/unsigned-integer-in-javascript/7414641#7414641
function ip2long(ip) {
  let ipl = 0;
  ip.split('.').forEach(octet => {
    ipl <<= 8;
    ipl += parseInt(octet, 10);
  });
  return ipl >>> 0;
}
