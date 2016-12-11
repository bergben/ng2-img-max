import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class ImgCropService {
    public cropImage(file: File, toWidth: number, toHeight: number, startX: number = 0, startY: number = 0): Observable<any> {
        let croppedImageSubject: Subject<any> = new Subject<any>();
        if (file.type !== "image/jpeg" && file.type !== "image/png") {
            croppedImageSubject.next({croppedFile:file, reason: "File provided is neither of type jpg nor of type png.", error: "INVALID_EXTENSION"});
            return;
        }
        let cvs = document.createElement('canvas');
        let ctx = cvs.getContext('2d');
        let img = new Image();
        img.onload = () => {
            cvs.width=toWidth;
            cvs.height=toHeight;
            ctx.drawImage(img, startX, startY, toWidth, toHeight, 0, 0, toWidth, toHeight);
            cvs.toBlob((blob)=>{
                let newFile = new File([blob], file.name, { type: file.type, lastModified: new Date().getTime() });
                croppedImageSubject.next(newFile);
                window.URL.revokeObjectURL(img.src);
            });
        }
        img.src = window.URL.createObjectURL(file);
        return croppedImageSubject.asObservable();
    }
}