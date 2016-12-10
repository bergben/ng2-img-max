# ng2-img-max

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
    }
}
```

## Methods


## To-do
 - Provide a demo
