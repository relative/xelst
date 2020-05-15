;(() => {
  /*
  # nginx config
  server {
    listen 80;
    listen [::]:80;
    listen 443 ssl;
    listen [::]:443 ssl;

    server_name krone_rgb.pit.red;

    location / {
            proxy_pass http://ip:port;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $host;
    }
  }
  */
  window.connected = false
  window.prevConnected = false
  const inputRed = document.getElementById('input-red')
  const inputGreen = document.getElementById('input-green')
  const inputBlue = document.getElementById('input-blue')

  const sliderRed = document.getElementById('color-red')
  const sliderGreen = document.getElementById('color-green')
  const sliderBlue = document.getElementById('color-blue')
  const URL = 'wss://krone_rgb.pit.red'
  function log(...args) {
    console.log(
      `%cr%cg%cb\t%c${args.join(' ')}`,
      'color:red;font-weight: 800;',
      'color:green;font-weight: 800;',
      'color:blue;font-weight: 800;',
      ''
    )
    const el = document.createElement('span')
    el.setAttribute('data-ty', 'input')
    el.setAttribute('data-ty-prompt', '▲')
    el.innerText = args.join(' ')
    document.getElementById('termynal').appendChild(el)
  }
  function sendToServer() {
    if (!window.connected) {
      log('not connected to server!')
    }
    ws.send(
      'c',
      parseInt(inputRed.value),
      parseInt(inputGreen.value),
      parseInt(inputBlue.value)
    )
  }
  function connect(e) {
    if (window.ws && window.ws.readyState === WebSocket.OPEN) {
      window.ws.close() // close existing ws if it exists
    }
    if (e) e.preventDefault()

    let ws = new WebSocket(URL)

    name = document.getElementById('input-name').value
    if (name.length > 10) {
      name = name.substr(0, 9)
    }
    window.localStorage.setItem('xelst_name', name)
    ws.onopen = () => {
      log('connected to server')
      ws.send('j', name)
      window.connected = true
      if (window.prevConnected) {
        sendToServer()
        // send previous colors to server
      }
    }
    ws._send = ws.send
    ws.send = (...args) => {
      return ws._send(msgpack.encode(args))
    }
    ws.onmessage = (msg) => {
      log(msg.data)
    }
    ws.onerror = (e) => {
      log('failed to connect to websocket, more information may be below.')
      window.connected = false
    }
    ws.onclose = (e) => {
      log('websocket closed! code', e.code, e.reason)
      window.connected = false
      window.prevConnected = true
      // try reconnecting
      log('attempting to reconnect!')
      connect()
    }
    window.ws = ws
  }
  function randomColor(e) {
    e.preventDefault()
    let r = (256 * Math.random()) | 0
    let g = (256 * Math.random()) | 0
    let b = (256 * Math.random()) | 0
    inputRed.value = r
    sliderRed.value = r
    inputGreen.value = g
    sliderGreen.value = g
    inputBlue.value = b
    sliderBlue.value = b
    updateColor()
    sendToServer()
  }
  let map = [
    [sliderRed, inputRed],
    [sliderBlue, inputBlue],
    [sliderGreen, inputGreen],
  ]
  const previewEl = document.getElementsByClassName('color-preview')[0]
  function updateColor() {
    const clrs = [
      parseInt(inputRed.value),
      parseInt(inputGreen.value),
      parseInt(inputBlue.value),
    ]
    previewEl.style = `background:rgb(${clrs.join(',')});`
  }
  map.forEach((m) => {
    let slider = m[0]
    let input = m[1]
    slider.oninput = () => {
      input.value = slider.value
      updateColor()
    }
    input.oninput = () => {
      let val = parseInt(input.value.replace(/\D+/g, ''))
      if (!val || val === NaN) val = 0
      if (val < 0) val = 0
      if (val > 255) val = 255
      input.value = val.toString()

      slider.value = val
      updateColor()
    }
    slider.onchange = () => {
      sendToServer()
    }
    input.onchange = () => {
      sendToServer()
    }
  })
  inputRed.value = sliderRed.value
  inputGreen.value = sliderGreen.value
  inputBlue.value = sliderBlue.value

  let terminal = new Termynal('#termynal')

  window.connect = connect
  window.term = terminal
  window.log = log
  document.getElementById('btn-connect').onclick = connect

  document.getElementById('btn-rc').onclick = randomColor
  new Twitch.Embed('twitch-embed', {
    width: '100%',
    height: 860,
    channel: 'XELST',
  })

  if (window.localStorage.getItem('xelst_name')) {
    document.getElementById('input-name').value = window.localStorage.getItem(
      'xelst_name'
    )
  }
})()
