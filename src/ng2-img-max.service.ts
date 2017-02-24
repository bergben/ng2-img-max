import { Injectable, Inject, forwardRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ImgMaxSizeService } from './img-max-size.service';
import { ImgMaxPXSizeService } from './img-maxpx-size.service';

@Injectable()
export class Ng2ImgMaxService {
    constructor(@Inject(forwardRef(() => ImgMaxSizeService)) private imgMaxSizeService: ImgMaxSizeService, @Inject(forwardRef(() => ImgMaxPXSizeService)) private imgMaxPXSizeService: ImgMaxPXSizeService) {
    }
    public compress(files: File[], maxSizeInMB: number, ignoreAlpha: boolean = false, logExecutionTime: boolean = false): Observable<any> {
        let compressedFileSubject: Subject<any> = new Subject<any>();
        files.forEach((file) => {
            this.compressImage(file, maxSizeInMB, ignoreAlpha, logExecutionTime).subscribe((value) => {
                compressedFileSubject.next(value);
            });
        });
        return compressedFileSubject.asObservable();
    }
    public resize(files: File[], maxWidth: number, maxHeight: number, logExecutionTime: boolean = false): Observable<any> {
        let resizedFileSubject: Subject<any> = new Subject<any>();
        files.forEach((file) => {
            this.resizeImage(file, maxWidth, maxHeight, logExecutionTime).subscribe((value) => {
                resizedFileSubject.next(value);
            });
        });
        return resizedFileSubject.asObservable();
    }
    public compressImage(file: File, maxSizeInMB: number, ignoreAlpha: boolean = false, logExecutionTime: boolean = false): Observable<any> {
        return this.imgMaxSizeService.compressImage(file, maxSizeInMB, ignoreAlpha, logExecutionTime);
    }
    public resizeImage(file: File, maxWidth: number, maxHeight: number, logExecutionTime: boolean = false): Observable<any> {
        return this.imgMaxPXSizeService.resizeImage(file, maxWidth, maxHeight, logExecutionTime);
    }
}