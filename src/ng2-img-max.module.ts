import { NgModule, ModuleWithProviders } from "@angular/core";
import { Ng2ImgMaxService } from "./ng2-img-max.service";
import { ImgMaxSizeService } from "./img-max-size.service";
import { ImgMaxPXSizeService } from "./img-maxpx-size.service";
import { ImgExifService } from "./img-exif.service";
import { Ng2PicaModule } from "ng2-pica";

@NgModule({
    imports:[
        Ng2PicaModule
    ],
    providers: [
        {provide: ImgMaxPXSizeService, useClass: ImgMaxPXSizeService},
        {provide: ImgMaxSizeService, useClass: ImgMaxSizeService},
        {provide: ImgExifService, useClass: ImgExifService},
        {provide: Ng2ImgMaxService, useClass: Ng2ImgMaxService}
    ]
})
export class Ng2ImgMaxModule {}
