import { Injectable } from '@angular/core';
import * as exifr from 'exifr';

@Injectable()
export class ImgExifService {
    public getOrientedImage(image:HTMLImageElement):Promise<HTMLImageElement> {
        return new Promise<HTMLImageElement>(resolve => {
            let img:any;
			exifr.orientation(image).then(orientation => {
                if (orientation != 1) {
                    let canvas:HTMLCanvasElement = document.createElement("canvas"),
                        ctx:CanvasRenderingContext2D = <CanvasRenderingContext2D> canvas.getContext("2d"),
                        cw:number = image.width,
                        ch:number = image.height,
                        cx:number = 0,
                        cy:number = 0,
                        deg:number = 0;
                    switch (orientation) {
                        case 3:
                        case 4:
                            cx = -image.width;
                            cy = -image.height;
                            deg = 180;
                            break;
                        case 5:
                        case 6:
                            cw = image.height;
                            ch = image.width;
                            cy = -image.height;
                            deg = 90;
                            break;
                        case 7:
                        case 8:
                            cw = image.height;
                            ch = image.width;
                            cx = -image.width;
                            deg = 270;
                            break;
                        default:
                            break;
                    }

                    canvas.width = cw;
                    canvas.height = ch;
                    if ([2, 4, 5, 7].indexOf(orientation) > -1) {
                        //flip image
                         ctx.translate(cw, 0);
                         ctx.scale(-1, 1);
                    }
                    ctx.rotate(deg * Math.PI / 180);
                    ctx.drawImage(image, cx, cy);
                    img = document.createElement("img");
                    img.width = cw;
                    img.height = ch;
                    img.addEventListener('load', function () {
                        resolve(img);
                    });
                    img.src = canvas.toDataURL("image/png");
                } else {
                    resolve(image);
                }
            });
        });
    }
}