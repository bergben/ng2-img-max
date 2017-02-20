export default {
  entry: 'dist/ng2-img-max.js',
  dest: 'dist/bundles/ng2-img-max.umd.js',
  sourceMap: false,
  format: 'umd',
  moduleName: 'ng2-img-max',
  globals: {
    '@angular/core': 'ng.core',
    'rxjs': 'Rx'
  }
}
