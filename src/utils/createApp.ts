import { Group } from "tweedle.js";
import { Application, Ticker } from "pixi.js";

export function createApp() {
    if (document.getElementById("WDS")) {
      document.getElementById("WDS")!.remove();
    }
  
    const pixiapp = new Application<HTMLCanvasElement>({
      hello: false,
      width: 1920,
      height: 1080,
    });
  
    (globalThis as any).__PIXI_APP__ = pixiapp;
  
    pixiapp.view.setAttribute("id", "WDS");
    document.body.appendChild(pixiapp.view);
  
    Ticker.shared.add(() => Group.shared.update());
  
    let resize = () => {
      const screenWidth = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      );
      const screenHeight = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
      );
  
      const ratio = Math.min(screenWidth / 1920, screenHeight / 1080);
  
      let resizedX = Math.floor(1920 * ratio);
      let resizedY = Math.floor(1080 * ratio);
  
      pixiapp.view.style.width = resizedX + "px";
      pixiapp.view.style.height = resizedY + "px";
    };
  
    window.onresize = () => resize();
    resize();
    
    return pixiapp;
}