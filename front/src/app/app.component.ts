import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

interface Coordinates {
  x: number,
  y: number,
  color: string,
}

interface ServerMessage {
  type: string,
  circleSavedCoordinates: Coordinates[],
  squareSavedCoordinates: Coordinates[],
  coordinates: Coordinates,
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
  shape = 'square';

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
        decodedMessage.circleSavedCoordinates.forEach(c => {
          this.drawCircle(c.x, c.y, c.color);
        })
      }

      if (decodedMessage.type === 'PREV_SQUARES') {
        decodedMessage.squareSavedCoordinates.forEach(c => {
          this.drawSquare(c.x, c.y, c.color);
        })
      }

      if (decodedMessage.type === 'NEW_CIRCLE') {
        const {x, y, color} = decodedMessage.coordinates;
        this.drawCircle(x, y, color);
      }

      if (decodedMessage.type === 'NEW_SQUARE') {
        const {x, y, color} = decodedMessage.coordinates;
        this.drawSquare(x, y, color);
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

  drawSquare(x: number, y: number, color: string) {
    const canvas: HTMLCanvasElement = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = color;
    ctx.fillRect(x - 5, y - 5, 10, 10);
  }

  onCanvasClick(event: MouseEvent) {
    const {x, y} = {x: event.offsetX, y: event.offsetY};
    this.ws.send(JSON.stringify({
      type: this.shape === 'square' ? 'SEND_SQUARE' : 'SEND_CIRCLE',
      coordinates: {x, y, color: this.color},
    }));
  }

  ngOnDestroy(): void {
    this.ws.close();
  }
}
