import {NgModule} from "@angular/core";
import {Ng2ImgMaxService} from "./ng2-img-max.service";
import {ImgMaxSizeService} from "./img-max-size.service";
import {ImgMaxPXSizeService} from "./img-maxpx-size.service";
import {ImgExifService} from "./img-exif.service";
import {Ng2PicaService} from './ng2-pica.service';

@NgModule({
  providers: [
    Ng2PicaService,
    ImgMaxPXSizeService,
    ImgMaxSizeService,
    ImgExifService,
    Ng2ImgMaxService,
    Ng2PicaService
  ]
})
export class Ng2ImgMaxModule {
}
