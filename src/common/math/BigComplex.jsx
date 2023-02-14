import {create, all} from 'mathjs'

const config = {};
const math = create(all, config)
math.config({
   number: 'BigNumber',      // Default type of number:
                             // 'number' (default), 'BigNumber', or 'Fraction'
   precision: 512,            // Number of significant digits for BigNumbers
   epsilon: 1e-500
})

const MAX_COMPARE_DIGITS = 500;

export class BigComplex {

   re: 0;
   im: 0;

   constructor(re, im) {
      this.re = math.bignumber(re);
      this.im = math.bignumber(im);
   }

   toString = (limit = MAX_COMPARE_DIGITS) => {
      const re_str = `${this.re.toString()}`;
      const im_str = `${this.im.toString()}`;
      return `${re_str.substr(0, limit)}+${im_str.substr(0, limit)}i`;
   }

   compare = (z) => {
      const this_str = this.toString(MAX_COMPARE_DIGITS);
      const z_str = z.toString(MAX_COMPARE_DIGITS);
      return this_str === z_str ? true : false;
   }

   magnitude = () => {
      if (isNaN(this.re) || isNaN(this.im)) {
         return -1;
      }
      const re_squared = this.re.mul(this.re);
      const im_squared = this.im.mul(this.im);
      const sum_squares = math.chain(re_squared).add(im_squared).valueOf();
      return math.sqrt(sum_squares)
   }

   mul = (z) => {
      const re_left_part = this.re.mul(z.re);
      const re_right_part = this.im.mul(z.im);
      const re_part = math.subtract(re_left_part, re_right_part);
      const im_left_part = this.re.mul(z.im);
      const im_right_part = this.im.mul(z.re);
      const im_part = math.add(im_left_part, im_right_part);
      return new BigComplex(re_part, im_part)
   }

   divide = (den) => {
      const com_conj = new BigComplex(den.im, den.re);
      return this.mul(com_conj);
   }

   exp = () => {
      let big_result = new BigComplex(1, 0);
      let num = new BigComplex(1, 0);
      let factorial = math.bignumber(1);
      const epsilon = math.bignumber("1e-500");
      for (let i = 1; i < 500; i++) {
         num = num.mul(this);
         factorial = math.multiply(factorial, i);
         const recip_fact = math.divide(1, factorial);
         if (math.smaller(recip_fact, epsilon)) {
            console.log("precision reached at",i);
            break;
         }
         const term = num.scale(recip_fact);
         big_result = big_result.offset(term.re, term.im);
      }
      return big_result
   }

   log = () => {
      const z = math.complex(this.re, this.im);
      const result = math.log(z);
      return new BigComplex(result.re, result.im)
   }

   scale = (s) => {
      return new BigComplex(this.re.mul(s), this.im.mul(s));
   }

   offset = (re, im) => {
      return new BigComplex(this.re.add(re), this.im.add(im));
   }

   add = (c) => {
      return new BigComplex(this.re.add(c.re), this.im.add(c.im));
   }

   sqrt = () => {
      const re_squared = this.re.mul(this.re);
      // console.log("re_squared",re_squared.toString())

      const im_squared = this.im.mul(this.im);
      // console.log("im_squared",im_squared.toString())

      const sum_squares = math.chain(re_squared).add(im_squared).valueOf();
      // console.log("sum_squares",sum_squares.toString())

      const magnitude = math.sqrt(sum_squares)
      // console.log("magnitude",magnitude.toString())

      const re = math.chain(magnitude).add(this.re).multiply(0.5).sqrt().valueOf();
      // console.log("re",re.toString())

      const im = math.chain(magnitude).subtract(this.re).multiply(0.5).sqrt().multiply(math.sign(this.im)).valueOf();
      // console.log("im",im.toString())

      return new BigComplex(re, im);
   }
}

export default BigComplex;
