import { NgModule, ModuleWithProviders } from '@angular/core';
import { Ng2ImgMaxService } from './ng2-img-max.service';
import { Ng2PicaModule } from 'ng2-pica';

@NgModule({
    imports:[
        Ng2PicaModule
    ],
    providers: [
        {provide: Ng2ImgMaxService, useClass: Ng2ImgMaxService}
    ]
})
export class Ng2ImgMaxModule {}