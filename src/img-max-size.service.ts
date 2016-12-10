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
                    let ratioMaxSizeToInitialSize = currentSize / (this.initialFile.size/1024/1024);
                    let newQuality = 0;
                    let multiplicator = Math.abs(ratioMaxSizeToInitialSize - 1)*10/(currentStep*1.7);
                    if(multiplicator<1){
                        multiplicator=1;
                    }
                    if (ratioMaxSizeToCurrentSize >= 1) {
                        newQuality = quality + (ratioMaxSizeToCurrentSize - 1) * 10 * multiplicator;
                    }
                    else {
                        newQuality = quality - (1 - ratioMaxSizeToCurrentSize) * 10 * multiplicator;
                    }

                    if (newQuality > 100) {
                        //COMPRESSION END
                        //case that shouldn't exist - in that case just return the initial File
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
            }, this.initialFile.type, quality / 100);
        });
        return result;
    }
    private _logExecutionTime(logExecutionTime:Boolean):void{
        if(logExecutionTime){
            console.info("Execution time: ",new Date().getTime() - this.timeAtStart + "ms");
        }
    }
}