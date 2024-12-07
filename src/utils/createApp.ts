import { Group } from "tweedle.js";
import { Application, Ticker } from "pixi.js";

export async function createApp(preference: 'webgl' | 'webgpu' = 'webgpu') {
    if (document.getElementById("WDS")) {
      document.getElementById("WDS")!.remove();
    }
  
    const pixiapp = new Application();

    await pixiapp.init({
      preference,
      hello : true,
      width: 1920,
      height: 1080,
      antialias: true,//
      backgroundAlpha: 1,//
      backgroundColor : 0xdddddd,//
    });
  
    (globalThis as any).__PIXI_APP__ = pixiapp;
  
    (pixiapp.canvas as HTMLCanvasElement).setAttribute("id", "WDS");
    document.body.appendChild(pixiapp.canvas as HTMLCanvasElement);
  
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
  
      pixiapp.canvas.style.width = resizedX + "px";
      pixiapp.canvas.style.height = resizedY + "px";
    };
  
    window.onresize = () => resize();
    resize();
    
    return pixiapp;
}