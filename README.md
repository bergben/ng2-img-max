# ng2-img-max
Angular 2 module to resize images down to a certain width and height or to reduce the quality to fit a certain maximal filesize - all in the browser.

This means, the huge image that the user may select will never even need to be uploaded to the server.

## Install
```bash
$ npm install ng2-img-max --save
```

### Import the module
```TypeScript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Ng2ImgMaxModule } from 'ng2-img-max'; // <-- import the module
import { MyComponent } from './my.component';

@NgModule({
    imports: [BrowserModule,
              Ng2ImgMaxModule // <-- include it in your app module
             ],
    declarations: [MyComponent],  
    bootstrap: [MyComponent]
})
export class MyAppModule {}
```
## Usage
```TypeScript
import { Ng2ImgMaxService } from 'ng2-img-max';
[...]
    constructor(private ng2ImgMaxService: Ng2ImgMaxService) {
        this.ng2ImgMaxSerive.resize([someImage], 2000, 1000).subscribe((result)=>{
             if (typeof result.name !== 'undefined' && typeof result.size !== 'undefined' && typeof result.type !== 'undefined') {
                 //all good, result is a file
                  console.info(result);
             }
             else {
                 //something went wrong 
                  console.error(result);
             }
        });
    }
}
```

## Methods
### Maximal filesize
#### `compress(files: File[], maxSizeInMB: number, logExecutionTime: Boolean = false): Observable<any>` 
Method to compress an image. This reduces the quality of an image down until it fits a certain fileSize which is given as "maxSizeInMB".
Returns an observable that, onNext receives either a File when everything went as planned or an error Object if something went wrong. See the example above on how to see if the returned object is a file. 

#### `compressImage` 
Same as above just that it takes in only one file instead of a whole array of files.

### Maximal width / height

#### `resize(files: File[], maxWidth: number, maxHeight: number, logExecutionTime: Boolean = false): Observable<any>` 
Method to resize files if necessary down to a certain maximal width or maximal height in px. If you want only one limit just set the other max to 10.000: for example `resize([myfile1,myfile2],2000,10000).subscribe([...]`

#### `resizeImage` 
Same as above just that it takes in only one file instead of a whole array of files.

### Crop image (e.g. useful to create thumbnails)

#### `crop(files: File[], toWidth: number, toHeight: number, startX: number = 0, startY: number = 0): Observable<any>` 
Crops the given files down to the given width and height. startX and startY tell where the cropping should start as coordinates.
Returns an observable that, onNext receives either a File when everything went as planned or an error Object if something went wrong for every file given.

#### `cropImage` 
Same as above just that it takes in only one file instead of a whole array of files.

## Contribute 
Due to the lack of other algorithms that also reduce the filesize of an image by reducing the quality until it fits a certain limit, help to find the best possible algorithm to do so is much appreciated.
The current algorithm can be found here: https://github.com/bergben/ng2-img-max/blob/master/src/img-max-size.service.ts#L49.

## Limitations
Although the resizing functions do use web workers do to the heavy work, this is not possible for the compression methods. The reasons for this are that a web worker does not have access to the DOM and can therefor not create a new HtmlCanvasElement. Neither can it be passed as a parameter to the web worker, as a web worker can only receive serializable data, which only be the ImageData but that can only be turned into a 2DCanvasContext, not a HtmlCanvasElement itself without the DOM. 

## To-do
 - Provide a demo
