import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {ImgExifService} from './img-exif.service';
import picaLib from 'pica';

const pica = (picaLib as any)();
const globalWindow: any = window;

export interface ResizeCanvasOptions {
  quality?: number;
  alpha?: boolean;
  unsharpAmount?: number;
  unsharpRadius?: number;
  unsharpThreshold?: number;
}

export interface ResizeBufferOptions {
  src: Uint8Array;
  width: number;
  height: number;
  toWidth: number;
  toHeight: number;
  quality?: number;
  alpha?: boolean;
  unsharpAmount?: number;
  unsharpRadius?: number;
  unsharpThreshold?: number;
}

@Injectable({
  providedIn: 'root'
})
export class Ng2PicaService {
  constructor(private imageExifService: ImgExifService) {
  }

  public resize(files: File[], width: number, height: number, keepAspectRatio: boolean = false): Observable<any> {
    let resizedFile: Subject<File> = new Subject<File>();
    for (let i = 0; i < files.length; i++) {
      this.resizeFile(files[i], width, height, keepAspectRatio).then((returnedFile) => {
        resizedFile.next(returnedFile);
      }).catch((error) => {
        resizedFile.error(error);
      });
    }
    return resizedFile.asObservable();
  }

  public resizeCanvas(from: HTMLCanvasElement, to: HTMLCanvasElement, options: ResizeCanvasOptions): Promise<HTMLCanvasElement> {
    let result: Promise<HTMLCanvasElement> = new Promise((resolve, reject) => {
      let curPica = new pica();
      if (!curPica || !curPica.resize) {
        curPica = new globalWindow.pica();
      }
      curPica.resize(from, to, options)
        .then((response: any) => {
            resolve(response);
          },
          (error: any) => {
            reject(error);
          });
    });
    return result;
  }

  public resizeBuffer(options: ResizeBufferOptions): Promise<Uint8Array> {
    let result: Promise<Uint8Array> = new Promise((resolve, reject) => {
      let curPica = new pica();
      if (!curPica || !curPica.resizeBuffer) {
        curPica = new globalWindow.pica();
      }
      curPica.resizeBuffer(options)
        .then((response: any) => {
            resolve(response);
          },
          (error: any) => {
            reject(error);
          });
    });
    return result;
  }

  private resizeFile(file: File, width: number, height: number, keepAspectRatio: boolean = false): Promise<File> {
    let result: Promise<File> = new Promise((resolve, reject) => {
      let fromCanvas: HTMLCanvasElement = document.createElement('canvas');
      let ctx = fromCanvas.getContext('2d');
      let img = new Image();
      img.onload = () => {
        this.imageExifService.getOrientedImage(img).then(orientedImg => {
          globalWindow.URL.revokeObjectURL(img.src);
          fromCanvas.width = orientedImg.width;
          fromCanvas.height = orientedImg.height;
          ctx?.drawImage(orientedImg, 0, 0);
          let imageData = ctx?.getImageData(0, 0, orientedImg.width, orientedImg.height);
          if (keepAspectRatio && imageData) {
            let ratio = Math.min(width / imageData.width, height / imageData.height);
            width = Math.round(imageData.width * ratio);
            height = Math.round(imageData.height * ratio);
          }
          let useAlpha = true;
          if (file.type === "image/jpeg" || (file.type === "image/png" && !this.isImgUsingAlpha(imageData))) {
            //image without alpha
            useAlpha = false;
            ctx = fromCanvas.getContext('2d', {'alpha': false});
            ctx?.drawImage(orientedImg, 0, 0);
          }
          let toCanvas: HTMLCanvasElement = document.createElement('canvas');
          toCanvas.width = width;
          toCanvas.height = height;
          this.resizeCanvas(fromCanvas, toCanvas, {'alpha': useAlpha})
            .then((resizedCanvas: HTMLCanvasElement) => {
              resizedCanvas.toBlob((blob) => {
                if (!blob) {
                  return reject('error blob')
                }
                let newFile: File = this.generateResultFile(blob, file.name, file.type, new Date().getTime());
                resolve(newFile);
              }, file.type);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
      img.src = globalWindow.URL.createObjectURL(file);
    });
    return result;
  }

  private isImgUsingAlpha(imageData: any): boolean {
    for (var i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] !== 255) {
        return true;
      }
    }
    return false;
  }

  private generateResultFile(blob: Blob, name: string, type: string, lastModified: number): File {
    let resultFile = new Blob([blob], {type: type});
    return this.blobToFile(resultFile, name, lastModified);
  }

  private blobToFile(blob: Blob, name: string, lastModified: number): File {
    let file: any = blob;
    file.name = name;
    file.lastModified = lastModified;

    //Cast to a File() type
    return <File>file;
  }
}
