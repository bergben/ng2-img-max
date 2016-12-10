import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Ng2PicaService } from 'ng2-pica';

@Injectable()
export class ImgMaxPXSizeService {
    timeAtStart: number;
    constructor(private ng2PicaService: Ng2PicaService) {
    }
    public resizeImage(file: File, maxWidth: number, maxHeight: number, logExecutionTime: Boolean = false): Observable<any> {
        let resizedFileSubject: Subject<any> = new Subject<any>();
        this.timeAtStart = new Date().getTime();
        if (file.type !== "image/jpeg" && file.type !== "image/png") {
            resizedFileSubject.next({ resizedFile: file, reason: "The provided File is neither of type jpg nor of type png.", error: "INVALID_EXTENSION" });
            return;
        }
        let img = new Image();
        let self = this;
        img.onload = () => {
            let currentWidth = img.naturalWidth;
            let currentHeight = img.naturalHeight;
            let newWidth = currentWidth;
            let newHeight = currentHeight;
            if (newWidth > maxWidth) {
                newWidth = maxWidth;
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
            self.ng2PicaService.resize([file], newWidth, newHeight).subscribe((result) => {
                //check if result is file
                if (typeof result.name !== 'undefined' && typeof result.size !== 'undefined' && typeof result.type !== 'undefined') {
                    //all good, result is a file
                    resizedFileSubject.next(result);
                }
                else {
                    //something went wrong 
                    resizedFileSubject.next({ resizedFile: file, reason: result, error: "PICA_ERROR" });
                }
                self._logExecutionTime(logExecutionTime);
                window.URL.revokeObjectURL(img.src);
            });
        };
        img.src = window.URL.createObjectURL(file);

        return resizedFileSubject.asObservable();
    };
    private _logExecutionTime(logExecutionTime: Boolean): void {
        if (logExecutionTime) {
            console.info("Execution time: ", new Date().getTime() - this.timeAtStart + "ms");
        }
    }
}