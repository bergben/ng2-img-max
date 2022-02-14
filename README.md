[![Join the chat at https://gitter.im/bergben/bergben](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/bergben/bergben?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# ng2-img-max
Angular 2 and beyond module to resize images down to a certain width and height or to reduce the quality to fit a certain maximal filesize - all in the browser.

This means, the huge image that the user may select will never even need to be uploaded to the server.

## Demo
A simple demo is available on stackblitz: https://stackblitz.com/edit/angular-ivy-hnhy6v

## Browser support
This module is supported by all major browsers recent versions (IE 10+). 

Make sure to include the following polyfill for `HtmlCanvasElement.toBlob()`: https://www.npmjs.com/package/blueimp-canvas-to-blob

```bash
$ npm install blueimp-canvas-to-blob
```



### Make sure to check out [ng2-img-tools](https://github.com/bergben/ng2-img-tools) for further image manipulation such as resizing to an exact size (e.g. to create thumbnails) or image cropping as seen in the demo.

## Install
```bash
$ npm install ng2-img-max
```

### Import the module
Only needed for Angular versions prior to 13
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
        this.ng2ImgMaxService.resize([someImage], 2000, 1000).subscribe((result)=>{
        });
    }
}
```

## Methods
### Maximal filesize
#### IMPORTANT: Catch error cases
When using the compression methods you should make sure to catch the error cases. 
If an error happens, you will receive an object with the following properties: 
 `compressedFile`:`File`, `reason`: `string` and `error`:`string`

Possible errors are: <br /> 
<b>`INVALID_EXTENSION`</b>: File provided is neither of type jpg nor of type png). The `compressedFile` is the original file. <br />
<b>`PNG_WITH_ALPHA`</b>: File provided is a png image which uses the alpha channel. No compression possible unless `ignoreAlpha` is set to true. The `compressedFile` is the original file.<br />
<b>`MAX_STEPS_EXCEEDED`</b>: Could not find the correct compression quality in 15 steps - abort. This should rarely to never at all happen. The `compressedFile` is the result of step 15 of the compression.<br />
<b>`FILE_BIGGER_THAN_INITIAL_FILE`</b>: This should actually never happen, just a precaution. The `compressedFile` is the original file.<br />
<b>`UNABLE_TO_COMPRESS_ENOUGH`</b>: Could not compress image enough to fit the maximal file size limit. The `compressedFile` is a compression as close as it can get.<br />

Example code catch errors:

 ```TypeScript
this.ng2ImgMaxService.resize([someImage], 2000, 1000).subscribe(result => {
    //all good, result is a file
    console.info(result);
}, error => {
    //something went wrong 
    //use result.compressedFile or handle specific error cases individually
});
```

#### `compress(files: File[], maxSizeInMB: number, ignoreAlpha: boolean = false, logExecutionTime: boolean = false): Observable<any>` 
Method to compress an image. This reduces the quality of an image down until it fits a certain fileSize which is given as `maxSizeInMB`.
Set `ignoreAlpha` to true if you want to ignore the alpha channel for png images and compress them nonetheless (not recommended - the alpha channel will be lost and the resulting image might differ from the original image).
Returns an observable that for every file given, onNext receives either a File when everything went as planned or an error Object if something went wrong. 

#### `compressImage` 
Same as above just that it takes in only one file instead of a whole array of files.

### Maximal width / height

#### `resize(files: File[], maxWidth: number, maxHeight: number, logExecutionTime: boolean = false): Observable<any>` 
Method to resize files if necessary down to a certain maximal width or maximal height in px. If you want only one limit just set the other max to 10.000: for example `resize([myfile1,myfile2],2000,10000).subscribe([...]`

#### `resizeImage` 
Same as above just that it takes in only one file instead of a whole array of files.

### Get EXIF oriented image 
#### `getEXIFOrientedImage(image:HTMLImageElement): Promise<HTMLImageElement>`
Method that returns an image respecting the EXIF orientation data.

## Contribute 
Due to the lack of other algorithms that also reduce the filesize of an image by reducing the quality until it fits a certain limit, help to find the best possible algorithm to do so is much appreciated.
The current algorithm can be found here: https://github.com/bergben/ng2-img-max/blob/master/src/img-max-size.service.ts.

## Limitations
Although the resizing functions do use web workers to do the heavy work, this is not possible for the compression methods. The reasons for this are that a web worker does not have access to the DOM and can therefor not create a new HtmlCanvasElement. Neither can it be passed as a parameter to the web worker, as a web worker can only receive serializable data, which only be the ImageData but that can only be turned into a 2DCanvasContext, not a HtmlCanvasElement itself without the DOM. 
