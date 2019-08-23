import React from "react";
import "./App.css";

let canvas;
let currentPos;
let lastPos;
let isMouseDown;
let cx;
let currentTool;

function relativePos(event, element) {
  let rect = element.getBoundingClientRect();

  return {
    x: Math.floor(event.clientX - rect.left),
    y: Math.floor(event.clientY - rect.top)
  };
}

class LineToolBase {
  onMouseMove(event) {
    if (isMouseDown) {
      cx.beginPath();
      cx.moveTo(lastPos.x, lastPos.y);
      cx.lineTo(currentPos.x, currentPos.y);
      cx.stroke();
    }
  }
}

class LineTool extends LineToolBase {
  constructor() {
    super();
    cx.globalCompositeOperation = "source-over";
    cx.lineCap = "round";
  }
}

class Eraser extends LineToolBase {
  constructor() {
    super();
    cx.globalCompositeOperation = "destination-out";
  }
}

class Text {
  onMouseDown(event) {
    const text = prompt("text:", "");
    if (text) {
      const pos = relativePos(event, cx.canvas);
      cx.font = Math.max(7, cx.lineWidth) + "px sans-serif";
      cx.fillText(text, pos.x, pos.y);
    }
  }
}

class Spray {
  onMouseDown() {
    let radius = cx.lineWidth / 2;
    let area = radius * radius * Math.PI;
    let dotsPerTick = Math.ceil(area / 30);
    this.spray = setInterval(_ => {
      for (let i = 0; i < dotsPerTick; i++) {
        let offset = this.randomPointInRadius(radius);
        cx.fillRect(currentPos.x + offset.x, currentPos.y + offset.y, 1, 1);
      }
    }, 25);
  }
  randomPointInRadius(radius) {
    for (;;) {
      var x = Math.random() * 2 - 1;
      var y = Math.random() * 2 - 1;
      if (x * x + y * y <= 1) return { x: x * radius, y: y * radius };
    }
  }

  onMouseUp() {
    clearInterval(this.spray);
  }
}

const Herramientas = {
  line: LineTool,
  eraser: Eraser,
  text: Text,
  spray: Spray
};

const setCurrentTool = toolName => {
  const CurrentToolClass = Herramientas[toolName];
  currentTool = new CurrentToolClass();
  currentTool.initialize && currentTool.initialize();
};

function Tools() {
  return (
    <span>
      tools:
      <select onChange={event => setCurrentTool(event.target.value)}>
        <option>line</option>
        <option>eraser</option>
        <option>text</option>
        <option>spray</option>
      </select>
    </span>
  );
}

function Size(_props) {
  return (
    <span>
      Font Size:
      <select
        onChange={event => {
          cx.lineWidth = event.target.value;
        }}
      >
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <option>5</option>
        <option>8</option>
        <option>12</option>
        <option>25</option>
        <option>35</option>
        <option>50</option>
        <option>75</option>
        <option>100</option>
      </select>
    </span>
  );
}

function Color(_props) {
  return (
    <span>
      color:
      <input
        type="color"
        onChange={event => {
          cx.fillStyle = event.target.value;
          cx.strokeStyle = event.target.value;
        }}
      />
    </span>
  );
}

function loadImageURL(url) {
  let image = document.createElement("img");
  image.addEventListener("load", function() {
    let color = cx.fillStyle,
      size = cx.lineWidth;
    cx.canvas.width = image.width;
    cx.canvas.height = image.height;
    cx.drawImage(image, 0, 0);
    cx.fillStyle = color;
    cx.strokeStyle = color;
    cx.lineWidth = size;
  });
  image.src = url;
}

function Openfile() {
  return (
    <div>
      Openfile:
      <input
        className="click"
        type="file"
        onChange={event => {
          if (event.target.files.length === 0) return;
          const reader = new FileReader();
          reader.addEventListener("load", function() {
            loadImageURL(reader.result);
          });
          reader.readAsDataURL(event.target.files[0]);
        }}
      />
    </div>
  );
}

function Openurl() {
  let input;

  return (
    <form
      className="form"
      onSubmit={event => {
        event.preventDefault();
        loadImageURL(input.value);
      }}
    >
      Open URL:
      <input
        className="input"
        type="text"
        ref={node => {
          input = node;
        }}
      />
      <button type="submit">load</button>
    </form>
  );
}

function Save() {
  return (
    <button
      onClick={event => {
        event.preventDefault()
        const element = document.createElement("a");

        element.setAttribute("href", cx.canvas.toDataURL());
        element.setAttribute("download", 'asdf.jpg');
        element.style.display = "none";
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
      }}
    >
      Save
    </button>
  );
}

function App(_props) {
  return (
    <div>
      <div className="picture-panel">
        <canvas
          height= "500"
          width= "800"
          className="canvas"
          onMouseDown={ev => {
            isMouseDown = true;
            currentTool.onMouseDown && currentTool.onMouseDown(ev);
          }}
          onMouseUp={ev => {
            isMouseDown = false;
            currentTool.onMouseUp && currentTool.onMouseUp(ev);
          }}
          ref={node => {
            canvas = node;
            cx = canvas.getContext("2d");
            cx.fillStyle = "white";
            cx.fillRect(0, 0, canvas.width, canvas.height);
            cx.fillStyle = "black";
            setCurrentTool("line");
          }}
          onMouseMove={ev => {
            lastPos = currentPos;
            currentPos = relativePos(ev, cx.canvas);
            currentTool.onMouseMove && currentTool.onMouseMove(ev);
          }}
        />
      </div>
      <div className="flex-container">
        <div>
          <Tools />
        </div>
        <div>
          <Size />
        </div>
        <div>
          <Color />
        </div>
        <div>
          <Openfile />
        </div>
        <div>
          <Openurl />
        </div>
        <div>
          <Save />
        </div>
      </div>
    </div>
  );
}

export default App;
