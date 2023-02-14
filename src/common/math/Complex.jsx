
export class Complex {

   re: 0;
   im: 0;

   constructor(re, im) {
      this.re = re;
      this.im = im;
   }

   toString = () => {
      return `${this.re}+${this.im}i`;
   }

   compare = (z) => {
      const this_str = this.toString();
      const z_str = z.toString();
      return this_str === z_str;
   }

   magnitude = () => {
      if (isNaN(this.re) || isNaN(this.im)) {
         return -1;
      }
      return Math.sqrt(this.re * this.re + this.im * this.im)
   }

   mul = (z) => {
      const a = this.re;
      const b = this.im;
      const c = z.re;
      const d = z.im;
      return new Complex(a * c - b * d, a * d + b * c)
   }

   divide = (den) => {
      const com_conj = new Complex(den.im, den.re);
      return this.mul(com_conj);
   }

   scale = (s) => {
      return new Complex(s * this.re, s * this.im);
   }

   offset = (re, im) => {
      return new Complex(this.re + re, this.im + im);
   }

   add = (z) => {
      return new Complex(this.re + z.re, this.im + z.im);
   }

}

export default Complex;
