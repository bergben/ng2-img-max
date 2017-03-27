import { Injectable, Inject, forwardRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Ng2PicaService } from 'ng2-pica';

import { ImgExifService } from './img-exif.service';

@Injectable()
export class ImgMaxPXSizeService {
    timeAtStart: number;
    constructor(@Inject(forwardRef(() => Ng2PicaService)) private ng2PicaService: Ng2PicaService, @Inject(forwardRef(() => ImgExifService)) private imageExifService:ImgExifService) {
    }
    public resizeImage(file: File, maxWidth: number, maxHeight: number, logExecutionTime: boolean = false): Observable<any> {
        let resizedFileSubject: Subject<any> = new Subject<any>();
        this.timeAtStart = new Date().getTime();
        if (file.type !== "image/jpeg" && file.type !== "image/png") {
            //END OF RESIZE
            setTimeout(()=>{
                resizedFileSubject.error({ resizedFile: file, reason: "The provided File is neither of type jpg nor of type png.", error: "INVALID_EXTENSION" });
            },0);
            return resizedFileSubject.asObservable();
        }
        let img = new Image();
        let self = this;
        img.onload = () => {
            this.imageExifService.getOrientedImage(img).then(orientedImg=>{
                window.URL.revokeObjectURL(img.src);
                let currentWidth = orientedImg.width;
                let currentHeight = orientedImg.height;
                let newWidth = currentWidth;
                let newHeight = currentHeight;
                if (newWidth > maxWidth) {
                    newWidth = maxWidth
                    //resize height proportionally
                    let ratio = maxWidth / currentWidth; //is gonna be <1
                    newHeight = newHeight * ratio;
                }
                currentHeight = newHeight;
                if (newHeight > maxHeight) {
                    newHeight = maxHeight;
                    //resize width proportionally
                    let ratio = maxHeight / currentHeight; //is gonna be <1
                    newWidth = newWidth * ratio;
                }
                if(newHeight===orientedImg.height && newWidth === orientedImg.width){
                    //no resizing necessary
                    resizedFileSubject.next(file);
                    self.logExecutionTime(logExecutionTime);
                }
                else{
                    self.ng2PicaService.resize([file], newWidth, newHeight).subscribe((result) => {
                        //all good, result is a file
                        resizedFileSubject.next(result);
                        self.logExecutionTime(logExecutionTime);
                    }, error =>{
                        //something went wrong 
                        resizedFileSubject.error({ resizedFile: file, reason: error, error: "PICA_ERROR" });
                        self.logExecutionTime(logExecutionTime);
                    });
                }
            });
        };
        img.src = window.URL.createObjectURL(file);

        return resizedFileSubject.asObservable();
    };
    private logExecutionTime(logExecutionTime: boolean): void {
        if (logExecutionTime) {
            console.info("Execution time: ", new Date().getTime() - this.timeAtStart + "ms");
        }
    }
}