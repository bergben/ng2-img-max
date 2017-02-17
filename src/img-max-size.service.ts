import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

const MAX_STEPS=15;
declare var self:any;

@Injectable()
export class ImgMaxSizeService {
    timeAtStart: number;
    initialFile:File;
    constructor() {}
    public compressImage(file: File, maxSizeInMB: number, logExecutionTime: Boolean = false): Observable<any> {
        let compressedFileSubject: Subject<any> = new Subject<any>();
        this.timeAtStart = new Date().getTime();
        this.initialFile=file;
        if (file.type !== "image/jpeg" && file.type !== "image/png") {
            compressedFileSubject.next({compressedFile:file, reason: "File provided is neither of type jpg nor of type png.", error: "INVALID_EXTENSION"});
            return;
        }
        let oldFileSize = file.size / 1024 / 1024;
        if (oldFileSize < maxSizeInMB) {
            //FILE SIZE ALREADY BELOW MAX_SIZE -> no compression needed
            setTimeout(()=>{compressedFileSubject.next(file)},0);
        }
        else{
            let cvs = document.createElement('canvas');
            let ctx = cvs.getContext('2d');
            let img = new Image();
            let self=this;
            img.onload = () => {
                cvs.width = img.naturalWidth;
                cvs.height = img.naturalHeight;
                ctx.drawImage(img, 0, 0);

                self._getCompressedFile(cvs, 50, maxSizeInMB, 1).then((compressedFile) => {
                    compressedFileSubject.next(compressedFile);
                    window.URL.revokeObjectURL(img.src);
                    self._logExecutionTime(logExecutionTime);
                }).catch((error)=>{
                    compressedFileSubject.next(error);
                    window.URL.revokeObjectURL(img.src);
                    self._logExecutionTime(logExecutionTime);
                });
            }
            img.src = window.URL.createObjectURL(file);
        }
        return compressedFileSubject.asObservable();
    };
    private _getCompressedFile(cvs: HTMLCanvasElement, quality: number, maxSizeInMB: number, currentStep: number): Promise<File> {
        let result: Promise<File> = new Promise((resolve, reject) => {
            cvs.toBlob((blob) => {
                if (currentStep + 1 > MAX_STEPS) {
                    //COMPRESSION END
                    //maximal steps reached
                    let newFile = new File([blob], this.initialFile.name, { type: this.initialFile.type, lastModified: new Date().getTime() });
                    reject({compressedFile:newFile, reason: "Could not find the correct compression quality in "+MAX_STEPS+ " steps.", error: "MAX_STEPS_EXCEEDED"});
                }
                else {
                    //CALCULATE NEW QUALITY
                    let currentSize = blob.size / 1024 / 1024;
                    let ratioMaxSizeToCurrentSize = maxSizeInMB / currentSize;
                    if(ratioMaxSizeToCurrentSize>5){
                        //max ratio to avoid extreme quality values
                        ratioMaxSizeToCurrentSize=5;
                    }
                    let ratioMaxSizeToInitialSize = currentSize / (this.initialFile.size/1024/1024);
                    if(ratioMaxSizeToInitialSize<0.05){
                        //min ratio to avoid extreme quality values
                        ratioMaxSizeToInitialSize=0.05;
                    }
                    let newQuality = 0;
                    let multiplicator = Math.abs(ratioMaxSizeToInitialSize - 1)*10/(currentStep*1.7)/ratioMaxSizeToCurrentSize;
                    if(multiplicator<1){
                        multiplicator=1;
                    }
                    if (ratioMaxSizeToCurrentSize >= 1) {
                        newQuality = quality + (ratioMaxSizeToCurrentSize - 1) * 10 * multiplicator;
                    }
                    else {
                        newQuality = quality - (1 - ratioMaxSizeToCurrentSize) * 10 * multiplicator;
                    }

                    if(newQuality > 100){
                        //max quality = 100, so let's set the new quality to the value in between the old quality and 100 in case of > 100
                        newQuality= quality + (100 - quality)/2;
                    }
                    
                    if(newQuality < 0){
                        //min quality = 0, so let's set the new quality to the value in between the old quality and 0 in case of < 0
                        newQuality= quality - quality/2;
                    }

                    if (quality===100 && newQuality >= 100) {
                        //COMPRESSION END
                        //Seems like quality 100 is max but file still too small, case that shouldn't exist as the compression shouldn't even have started in the first place
                        reject({compressedFile:this.initialFile, reason: "Unfortunately there was an error while compressing the file.", error: "FILE_BIGGER_THAN_INITIAL_FILE"});
                    }
                    else if ((quality < 1)&&(newQuality<quality)) {
                        //COMPRESSION END
                        //File size still too big but can't compress further than quality=0
                        let newFile = new File([blob], this.initialFile.name, { type: this.initialFile.type, lastModified: new Date().getTime() });
                        reject({compressedFile:newFile, reason: "Could not compress image enough to fit the maximal file size limit.", error: "UNABLE_TO_COMPRESS_ENOUGH"});
                    }

                    else if ((newQuality > quality) && (Math.round(quality) == Math.round(newQuality))) {
                        //COMPRESSION END
                        //next steps quality would be the same quality but newQuality is slightly bigger than old one, means we most likely found the nearest quality to compress to maximal size
                        let newFile = new File([blob], this.initialFile.name, { type: this.initialFile.type, lastModified: new Date().getTime() });
                        resolve(newFile);
                    }

                    else if (currentStep>5 && (newQuality > quality) && (newQuality < quality+2)) {
                        //COMPRESSION END
                        //for some rare occasions the algorithm might be stuck around e.g. 98.5 and 97.4 because of the maxQuality of 100, the current quality is the nearest possible quality in that case
                        let newFile = new File([blob], this.initialFile.name, { type: this.initialFile.type, lastModified: new Date().getTime() });
                        resolve(newFile);
                    }
                    else if ((newQuality > quality) && Number.isInteger(quality) && (Math.floor(newQuality) == quality)) {
                        //COMPRESSION END
                        /* 
                           in the previous step if ((quality > newQuality) && (Math.round(quality) == Math.round(newQuality))) applied, so
                           newQuality = Math.round(newQuality) - 1; this was done to reduce the quality at least a full integer down to not waste a step
                           with the same compression rate quality as before. Now, the newQuality is still only in between the old quality (e.g. 93) 
                           and the newQuality (e.g. 94) which most likely means that the value for the newQuality (the bigger one) would make the filesize
                           too big so we should just stick with the current, lower quality and return that file.
                        */
                        let newFile = new File([blob], this.initialFile.name, { type: this.initialFile.type, lastModified: new Date().getTime() });
                        resolve(newFile);
                    }
                    else {
                        //CONTINUE COMPRESSION
                        if ((quality > newQuality) && (Math.round(quality) == Math.round(newQuality))) {
                            //quality can only be an integer -> make sure difference between old quality and new one is at least a whole integer number
                            // - it would be nonsense to compress again with the same quality
                            newQuality = Math.round(newQuality) - 1;
                        }
                        //recursively call function again
                        resolve(this._getCompressedFile(cvs, newQuality, maxSizeInMB, currentStep + 1));
                    }
                }
            }, "image/jpeg", quality / 100);
        });
        return result;
    }
    private _logExecutionTime(logExecutionTime:Boolean):void{
        if(logExecutionTime){
            console.info("Execution time: ",new Date().getTime() - this.timeAtStart + "ms");
        }
    }
}