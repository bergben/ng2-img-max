import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ImgCropService } from './img-crop.service';
import { ImgMaxSizeService } from './img-max-size.service';
import { ImgMaxPXSizeService } from './img-maxpx-size.service';

@Injectable()
export class Ng2ImgMaxService {
    constructor(private imgMaxSizeService: ImgMaxSizeService, private imgMaxPXSizeService: ImgMaxPXSizeService, private imgCropService: ImgCropService) {
    }
    public compress(files: File[], maxSizeInMB: number, logExecutionTime: Boolean = false): Observable<any> {
        let compressedFileSubject: Subject<any> = new Subject<any>();
        files.forEach((file) => {
            this.compressImage(file, maxSizeInMB, logExecutionTime).subscribe((value) => {
                compressedFileSubject.next(value);
            });
        });
        return compressedFileSubject.asObservable();
    }
    public resize(files: File[], maxWidth: number, maxHeight: number, logExecutionTime: Boolean = false): Observable<any> {
        let resizedFileSubject: Subject<any> = new Subject<any>();
        files.forEach((file) => {
            this.resizeImage(file, maxWidth, maxHeight, logExecutionTime).subscribe((value) => {
                resizedFileSubject.next(value);
            });
        });
        return resizedFileSubject.asObservable();
    }
    public crop(files: File[], toWidth: number, toHeight: number, startX: number = 0, startY: number = 0): Observable<any> {
        let croppedFileSubject: Subject<any> = new Subject<any>();
        files.forEach((file) => {
            this.cropImage(file, toWidth, toHeight, startX, startY).subscribe((value) => {
                croppedFileSubject.next(value);
            });
        });
        return croppedFileSubject.asObservable();
    }
    public cropImage(file: File, toWidth: number, toHeight: number, startX: number = 0, startY: number = 0): Observable<any> {
        return this.imgCropService.cropImage(file, toWidth, toHeight, startX, startY);
    }
    public compressImage(file: File, maxSizeInMB: number, logExecutionTime: Boolean = false): Observable<any> {
        return this.imgMaxSizeService.compressImage(file, maxSizeInMB, logExecutionTime);
    }
    public resizeImage(file: File, maxWidth: number, maxHeight: number, logExecutionTime: Boolean = false): Observable<any> {
        return this.imgMaxPXSizeService.resizeImage(file, maxWidth, maxHeight, logExecutionTime);
    }
}