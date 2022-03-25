import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

interface Circle {
  x: number,
  y: number,
  color: string,
}

interface ServerMessage {
  type: string,
  coordinates: Circle[],
  circleCoordinates: Circle,
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy, AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef;
  colors = ['aqua', 'red', 'yellow', 'green'];
  color = 'red';

  ws!: WebSocket;

  ngAfterViewInit() {
    this.ws = new WebSocket('ws://localhost:8000/draw');
    this.ws.onclose = () => {
      setTimeout(() => {
        this.ws = new WebSocket('ws://localhost:8000/draw');
      }, 1000);
    };

    this.ws.onmessage = event => {
      const decodedMessage: ServerMessage = JSON.parse(event.data);

      if (decodedMessage.type === 'PREV_CIRCLES') {
        decodedMessage.coordinates.forEach(c => {
          this.drawCircle(c.x, c.y, c.color);
        })
      }

      if (decodedMessage.type === 'NEW_CIRCLE') {
        const {x, y, color} = decodedMessage.circleCoordinates;
        this.drawCircle(x, y, color);
      }
    }
  }

  drawCircle(x: number, y: number, color: string) {
    const canvas: HTMLCanvasElement = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d')!;

    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  onCanvasClick(event: MouseEvent) {
    const {x, y} = {x: event.offsetX, y: event.offsetY};
    this.ws.send(JSON.stringify({
      type: 'SEND_CIRCLE',
      coordinates: {x, y, color: this.color},
    }));
  }

  ngOnDestroy(): void {
    this.ws.close();
  }
}
