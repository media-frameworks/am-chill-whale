// JS BigNumber Utilities  Dr Ron Knott version of 19 March 2019:  ronknott AT mac DOT com

var BN1 = new BigNumber(1),
   BN0 = new BigNumber(0), BNm1 = new BigNumber(-1), BN2 = new BigNumber(2), BN3 = new BigNumber(3),
   BN5 = new BigNumber(5), BN10 = new BigNumber(10),
   BNinf = new BigNumber(Infinity);
BNminf = new BigNumber(-Infinity);
BNpi = new BigNumber("3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196"),
   BNe = new BigNumber("2.718281828459045235360287471352662497757247093699959574966967627724076630353547594571382178525166427427466391932003059921817413596629043572900334295260595630738132328627943490763233829880753195251019011"),
   BNEulerGamma = new BigNumber("0.577215664901532860606512090082402431042159335939923598805767234884867726777664670936947063291746749515"),
   BNphi = new BigNumber("1.618033988749894848204586834365638117720309179805762862135448622705260462818902449707207204189391137484754088075386891752126633862223536931793180060766726354433389086595939582905638322661319928290267880675208766892501711696207032221043216269548626296313614"),
   MAXINT = 9007199254740991;

function BNdps() {
   return BigNumber.config().DECIMAL_PLACES
};

function BNsetdps(nbdps) {
   if (BNdps() != nbdps + 5) {
      BigNumber.config({ //EXPONENTIAL_AT: ndps,  //Keep all output to max nb digits
         DECIMAL_PLACES: nbdps + 5
      });
   }
};

function HALT(msg) {
   if (msg != "") alert("**Problem** " + msg);//self.onerror=resetERROR;
   STOP()
};

BigNumber.prototype.inc = function () {
   return this.add(1)
};

function fw(n, fwd) {
   if (arguments.length < 2) HALT("Function fw needs a second argument");
   if (!isInt(fwd) || fwd <= 0) HALT("Function fw needs a positive whole number for the second argument");
   var s = (typeof n == "string" ? n : n.toString());
   while (s.length < fwd) s = " " + s;
   return s
};

function BNegcd(x, y) {
   if (typeof x == "number") x = new BigNumber(x);
   if (typeof y == "number") y = new BigNumber(y);
   if (x instanceof BigNumber && y instanceof BigNumber) {
   } else HALT("BNegcd called on non-BigNumber");
   var a0 = BN1, a1 = BN0, b0 = BN0, b1 = BN1, a2 = x, b2 = y, q, z;
   while (!(b2.eq(0))) {
      q = a2.divToInt(b2);
      z = a0.sub(q.mul(b0));
      a0 = b0;
      b0 = z;
      z = a1.sub(q.mul(b1));
      a1 = b1;
      b1 = z;
      z = a2.sub(q.mul(b2));
      a2 = b2;
      b2 = z
      // putmsg([a0,a1,a2]+" "+[b0,b1,b2]+" q="+q);
   }
   ;
   if (a2.lte(0)) {
      a1 = a1.negated(), a2 = a2.negated()
   }
   ;
   // putmsg("egcd "+x+" "+y+" "+[a0,a1,a2]+" CHECK:"+(a0*x+a1*y)+"="+a2);
   return [a0, a1, a2] // ASSERT a0*x+a1*y==g==a2
};

function BNgcd3(a, b, c) {
   if (typeof a == "number") a = new BigNumber(a);
   if (typeof b == "number") b = new BigNumber(b);
   if (typeof c == "number") c = new BigNumber(c);
   return BNegcd(BNegcd(a.abs(), b.abs())[2], c.abs())[2]
}

function BNgcd(a, b) {
   if (isInt(a)) a = new BigNumber(a);
   if (isInt(b)) b = new BigNumber(b);
   return BNegcd((a.eq(0) ? BN1 : a.abs()), (b.eq(0) ? BN1 : b.abs())) [2]
};

var BNGCD = BNgcd;

function BNlcm(a, b) {
   if (typeof a == "number") a = new BigNumber(a);
   if (typeof b == "number") b = new BigNumber(b);
   return a.mul(b).div(BNgcd(a, b))
};

function BNsqrfactor(n) {
   var N = n;
   if (n.eq(0)) return BN1;
   if (n.lt(0)) n = n.negated();
   var f = BN1, lim = n.sqrt();
   //if(debug)DBG("\rsqrfactor of "+n+ " lim="+lim);
   //if(lim>100000)
   //   if(!confirm("To simplify the fraction may take a while - do you still want simplification?"))
   //       {return 1};
   while (n.mod(4).eq(0)) {
      f = f.mul(4);
      n = n.divToInt(4)
   }
   ;
   //if(n<9)return f;
   for (var i = new BigNumber(3), ii = new BigNumber(9); n.gte(ii) && i.lte(lim); i = i.add(2), ii = i.mul(i)) {//if(debug)DBG("sqrf i="+i+" ii="+ii+" n="+n);
      while (n.gte(ii) && n.mod(ii).eq(0)) {
         f = f.mul(ii);
         n = n.divToInt(ii)
         //if(debug)DBG(" ..f="+f+" n="+n)
      }
   }
   ;
   //if(debug)DBG("sqrfactor of "+N+" = "+f+" *"+n);
   return f
};


function BNrandomInt(lo, hi, width) { //all ints in range lo..hi inclusive are equally likely
   if (typeof lo == "number") lo = new BigNumber(lo);
   if (typeof hi == "number") hi = new BigNumber(hi);
   if (arguments.length < 3) width = 20;
   if (hi.le(lo)) HALT("Random int arguments: lo must be less than hi");
   do {
      var r = BigNumber.random(width).mul(hi.sub(lo).add(1)).add(lo).floor()
   }
   while (r.gt(hi));  //random can return 1.00!!
   return r
}


BigNumber.prototype.ne = function (x) {
   return !this.eq(x)
};
BigNumber.prototype.le = BigNumber.prototype.lte;
BigNumber.prototype.ge = BigNumber.prototype.gte;

function BNmax(BNrow) {
   if (arguments.length == 1 && !isArray(BNrow)) HALT("?? BNmax expects an array of BN");
   var row = BNrow;
   if (row.length == 0) HALT("?? BNmax given empty Array");
   for (var i = 1, maxi = 0; i < row.length; i++)
      if (row[i].gt(row[maxi])) maxi = i;
   // putmsg("BNmax of "+BNrow+" is@"+maxi+" = "+BNrow[maxi]);
   return row[maxi]
};

function BNmaxabs(BNrow) { //return the element with max ABS value, may be -ve
   if (arguments.length != 1 || !isArray(BNrow)) HALT("?? BNmax expects an array of BN");
   var row = (arguments.length == 1 ? BNrow : arguments);
   if (row.length == 0) HALT("?? BNmax given empty Array");
   for (var i = 1, maxi = 0; i < row.length; i++)
      if (row[i].abs().gt(row[maxi].abs())) maxi = i;
   // putmsg("BNmax of "+BNrow+" is@"+maxi+" = "+BNrow[maxi]);
   return row[maxi]
};

function BNeq(a, b, eps) {
   if (typeof a == "number" || typeof a == "string") a = new BigNumber(a);
   if (typeof b == "number" || typeof b == "string") b = new BigNumber(b);
// putmsg("test "+echotypeBN(a)+" =?= "+echotypeBN(b)+" err="+nb(eps));
   if (arguments.length < 3) eps = BN0;
   if (a instanceof BigNumber) {
      if (b instanceof BigNumber) return a.sub(b).abs().le(eps)
      else HALT("BNeq given non-BN arg: " + typeof a)
   } else HALT("BNeq given a non BN argument: " + typeof b)
};

BigNumber.prototype.sqr = function () {
   return this.mul(this)
};

//BigNumber.max(bn1,bn2, ... ) and BigNumber.min(bn1,bn2,...) are built-in
//ALSO can have 1 arg which is an Array

function BNlog(x) { //uses GLOBAL ndps
   //using Maclaurin series if x>0:  y=(x-1)/(x+1); Log(x)=2(y+y^3/3+y^5/5+y^7/7...)
   //see Omondi Computer Arithmetic Systems page 420
   if (typeof x == "number" || typeof x == "string") x = new BigNumber(x);
   var xIN = x, mant = 0, e = BNEpow(1), epow, pow = 0, z;
   if (x.isNeg()) HALT("!! Cannot take the log of a negative number: " + x)
   else if (x.isZero()) L = BN1
   else {
      if (x.gt(e)) {
         pow = -1;
         epow = BN1;
         while ((z = epow.mul(e)).lt(x)) {
            epow = z;
            pow++;
         }
         ;
         x = x.div(epow);
         pow++;
      }
      ; //putmsg("BNloga: "+x+" pow="+pow);
      if (x.lt(BN1)) {
         pow = 0;
         epow = e;
         while (x.mul(epow).lt(1)) {
            pow--;
            epow = epow.mul(e)
         }
         ;
         x = x.mul(epow);
         pow--
      }
      ;
      // putmsg("BNlogb "+x+" is "+pow);
      var y = x.sub(1).div(x.add(1));
      var ysqr = y.sqr(), L = y, term = y, i = 1, zero = new BigNumber("1e-" + (BNdps() + 9));
      while (term.gt(zero)) {
         i += 2;
         term = term.mul(ysqr);
         L = L.add(term.div(i))
      }
      ;
      L = L.mul(2).add(pow);
      // putmsg("BNlog max term was "+i+" lib val="+Math.log(xIN));
   }
   ;
   return L
};


BigNumber.prototype.powmod = function (Pow, Mod) { //works on larger Powers than built-in BN.pow
   //pow::int|BN, mod::BN
   if (isInt(Pow)) Pow = new BigNumber(Pow);
   var pm;
   if (Pow.lt(9007199254740991)) pm = this.pow(Pow, Mod)
      // else if(Pow.isZero())pm= BN1
   // else if(Pow.eq(1))pm= this.mod(Mod)
   else if (Pow.gt(1)) {
      var pmod2 = Pow.mod(2);
      var s = this.powmod(Pow.divToInt(2), Mod);
      var ss = s.sqr().mod(Mod);
      // if(isInt(ss))ss=ss%Mod
      // else {//putmsg(s+"^2="+ss);
      //      halt("Sorry - the numbers have become too large for this calculator")};
      pm = (pmod2.isZero() ? ss : this.mul(ss).mod(Mod))
   }
   ;
   //putmsg('BN powmod '+this+'^'+Pow+"%"+Mod+" <- "+pm)
   return pm
};
BigNumber.prototype.log = function (base) {
   return (arguments.length == 0 ? BNlog(this) : BNlog(this).div(BNlog(base)))
};


function BNEpow(x) { //BNe.topow is faster!
   if (typeof x == "number" || typeof x == "string") x = new BigNumber(x);
   if (!(x instanceof BigNumber)) HALT("E to power has wrong type of power value " + typeof (x));

   var term = BN1, ans = BN1, i = 0, zero = new BigNumber("1e-" + (BNdps() + 5)), sgn;
   if (x.isNeg()) {
      sgn = -1;
      x = x.neg()
   } else {
      sgn = 1
   }
   ;
   while (term.abs().gt(zero) && i < 500) {
      i++;
      term = term.mul(x).div(i);
      ans = ans.add(term)
   }
   ;
//putmsg("E^"+x+" = "+Math.exp(x)+" ("+(i-1)/2+" terms)");
   return (sgn < 0 ? BN1.div(ans) : ans)
};
BigNumber.prototype.exp = function () {
   return BNEpow(this)
};

function BNpow(b, p) { //BigNumber.pow only accepts integer powers!
   if (typeof b == "number" || typeof b == "string") b = new BigNumber(b);
   if (!(b instanceof BigNumber)) HALT("To-Power has wrong type of base value " + typeof (b));
   if (typeof p == "number" || typeof p == "string") p = new BigNumber(p);
   if (!(p instanceof BigNumber)) HALT("To-power has wrong type of power value " + typeof (p));
   var ans;
   if (p.isInt()) ans = b.pow(p)
   else ans = BNEpow(BNlog(b).mul(p));
   //if(p.isNeg())ans=BN1.div(ans);
// putmsg(b+"^"+p+"="+Math.pow(b.toNumber(),p.toNumber())+" <- "+ans.toFixed(ndps))
   return ans
};

BigNumber.prototype.topow = function (p) {
   return BNpow(this, p)
};


BigNumber.prototype.degtorad = function () {
   return this.div(45).mul(BN1.arctan())
};
BigNumber.prototype.radtodeg = function () {
   return this.div(BN1.arctan()).mul(45)
};
BigNumber.prototype.sin = function () {
   var x = new BigNumber(this), sign = 1, piover4 = BN1.arctan();
   var twopi = piover4.mul(8), halfpi = piover4.mul(2), pi = piover4.mul(4);
   if (x.isNeg()) {
      sign = -1;
      x = x.neg()
   }// 0<=x since sin(-x)=-sin(x)
   x = x.sub(x.div(twopi).floor().mul(twopi)); // 0<=x<=TwoPi
   if (x.gte(pi)) {
      x = x.sub(pi);
      sign *= -1
   }
   ; // 0<=x<Pi  since sin(x+Pi)=-sin(x)
   if (x.gte(halfpi)) {
      x = pi.sub(x)
   }
   ; //0<=x<Pi/2 since sin(x+Pi/2)=sin(Pi/2-x)
   //if(x.gte(Piover4)){return Piover2.sub(x).cos()}
   // 0<x<Pi/4<1
   var term = x, xsqr = x.sqr(), sum = x, i = 1, zero = new BigNumber("1e-" + (BNdps() + 5));
   //putmsg("sin of "+x);
   while (!term.round(BNdps()).isZero()) {
      term = term.mul(xsqr).div((i + 1) * (i + 2)).neg();
      sum = sum.add(term);
      i += 2;
   }
   ;
   //putmsg("sin "+i+" terms, final term is "+term+"="+term.round(ndps)+" sum="+sum.round(ndps,4)+"("+ndps+")");
   return (sign < 0 ? sum.neg() : sum).round(BNdps(), 4)
};
BigNumber.prototype.sec = function () {
   return BN1.div(this.cos())
};
BigNumber.prototype.cos = function () {
   var x = new BigNumber(this), sign = 1, piover4 = BN1.arctan();
   var halfpi = piover4.mul(2), twopi = piover4.mul(8), pi = piover4.mul(4);
   if (x.isNeg()) {
      x = x.neg()
   }
   ;  // 0<=x since cos(-x)=cos(x)
   x = x.sub(x.div(twopi).floor().mul(twopi)); // 0<=x<=TwoPi
   if (x.gte(pi)) {
      x = twopi.sub(x)
   } //0<=x<Pi since cos(x)=cos(2PI-x)
   if (x.gte(halfpi)) {
      x = pi.sub(x);
      sign *= -1
   } //0<=x<Pi/2 since cos(x)=-cos(Pi-x)
   return (sign < 0 ? halfpi.sub(x).sin().neg() : halfpi.sub(x).sin()) //since cos(x)=sin(Pi/2-x)
};
BigNumber.prototype.cosec = function () {
   return BN1.div(this.sin())
};
BigNumber.prototype.tan = function () { // up to about 250 dps
   BNsetdps(BNdps() + 9);
   var pi = BN1.arctan().mul(4);
   var a = this.mod(pi), sgn;
   if (a.isNeg()) {
      a = a.neg();
      sgn = -1
   } else {
      sgn = 1
   }
   ;
   // ASSERT 0<=a<Pi
   var t = BN0, i, asq = a.sqr();
   for (i = 181; i > 1; i = i - 2) {
      t = asq.div(t.sub(i).neg())
   }
   ;
   t = a.div(BN1.sub(t));
   if (sgn < 0) t = t.neg();
   BNsetdps(BNdps() - 9);
   return t
};
BigNumber.prototype.cot = function () {
   return BN1.div(this.tan())
};
BigNumber.prototype.arctan = function () {
   //arctan(-t)=-arctan(t); arctan(t>1)=Pi/2-arctan(1/t) !!this==1???
//From Mathworld, Euler's formula:  SLOW as x nears 1 so use half-angle formula!
   var delta = new BigNumber("1.0e-" + (BNdps() + 2).toString()), sgn, x = this;
   if (x.isNeg()) {
      sgn = -1;
      x = x.neg()
   } else {
      sgn = 1
   }
   ;
   if (x.gt(1)) {
      s = BN1.arctan().mul(2).sub(BN1.div(x).arctan())
   }
   // else if(x.gt(0.5))s=this.div(this.sqr().add(1).sqrt().add(1)).arctan().mul(2)
   else {
      var y = x.sqr().div(x.sqr().add(1)), s = x.div(x.sqr().add(1)), k = 1, lastt = BN0;
      var t = s;
      while (lastt.sub(t).abs().gt(delta)) {
         lastt = t;
         t = t.mul(2 * k).div(2 * k + 1).mul(y);
         s = s.add(t);
         k++
      }
   }
   ;
   return (sgn < 0 ? s.neg() : s)
};
BigNumber.prototype.arccot = function () {
   return BN1.div(this).arctan()
};
BigNumber.prototype.arcsin = function () {
   if (this.abs().gt(1)) HALT("arcsin was given an argument outside the range -1..1: " + this);
   return this.div(BN1.sub(this.sqr()).sqrt()).arctan()
};
BigNumber.prototype.arccos = function () {
   if (this.abs().gt(1)) HALT("arccos was given an argument outside the range -1..1): " + this);
   var ans = BN1.sub(this.sqr()).sqrt().div(this).arctan();
   return ans.isNeg() ? ans.add(BN1.arctan().mul(4)) : ans
};

BigNumber.prototype.sinh = function () {
   return (this.exp().sub(this.neg().exp())).div(2)
};
BigNumber.prototype.cosh = function () {  //result is >=1
   return (this.exp().add(this.neg().exp())).div(2)
};
BigNumber.prototype.tanh = function () {  //returns a value in range -1..1
   var e2 = this.mul(2).exp();
   return e2.sub(BN1).div(e2.add(BN1))
   //  var et=this.exp(),emt=this.neg().exp();
   //  return et.sub(emt).div(et.add(emt))
   //OR
//    var t=BN0,i,thissq=this.sqr();
//  for(i=181;i>1;i=i-2){t=thissq.div(t.add(i))};
//  t= this.div(BN1.add(t));
//  return t
};
BigNumber.prototype.arcsinh = function () {
   return this.add(this.sqr().add(1).sqrt()).log()
};
BigNumber.prototype.arccosh = function () {// 'this' must be >=1
   return (this.lt(1) ? HALT("arccosh was given an argument <1:" + this)
      : this.sqr().sub(1).sqrt().add(this).log())
};
BigNumber.prototype.arctanh = function () { //'this' must be in range -1..1
   if (this.lt(-1) || this.gt(1)) HALT("arctanh was given an argument not in range -1..1:" + this)
   else if (this.eq(BN1)) return BNinf
   else if (this.eq(BNm1)) return BNminf;
   BNsetdps(BNdps() + 5);
   var ans = this.add(1).div(this.neg().add(1)).log().div(2);
   BNsetdps(BNdps() - 5);
   return ans
};


BigNumber.prototype.factorial = function () {
   if (this.isNeg()) HALT("Cannot take the factorial of a negative number");
   if (!this.isInt()) HALT("Factorial is only defined for whole numbers: " + this);
   var f = BN1;
   for (var i = 1; this.ge(i); i++) f = f.mul(i);
   return f
};

BigNumber.prototype.factorialNbDigits = function (Base) {
   if (arguments.length == 0) Base = 10;
   return this.mul(BNpi).mul(2).sqrt().mul(this.div(BNe).topow(this)).log(Base).add(1).floor()
};

BigNumber.prototype.factorialApprox = function () {
   var dps = BigNumber.config().DECIMAL_PLACES;
   ///putmsg("dps was "+dps);
   BigNumber.config({DECIMAL_PLACES: 30})
   // putmsg(this.mul(BNpi).mul(2).sqrt());
   // putmsg(this.div(BNe).topow(this));
   var f = this.mul(BNpi).mul(2).sqrt().mul(this.div(BNe).topow(this))
   // putmsg(f);
   //this.mul(BNpi).mul(2).sqrt().mul(this.div(BNe).topow(this))
   BigNumber.config({DECIMAL_PLACES: dps});
   return f
};

function BNbincoeff(r, c) { //n and r are int, return BN
   var ans = BN1,
      rr = (typeof r == "number" ? new BigNumber(r) : r),
      cc = (typeof c == "number" ? new BigNumber(c) : c);
   if (rr.isNeg() || cc.isNeg() || cc.gt(rr)) ans = BN0
   else if (cc.isZero() || cc.eq(rr)) ans = BN1
   else {//if(r-c<c)c=r-c;
      //for(var i=r;i>=r-c+1;i--)ans=ans.mul(i);
      ans = rr.factorial().div(rr.sub(cc).factorial().mul(cc.factorial()))
   }
//putmsg("bnbincoeff "+r+"C"+c+" = "+ans+" top="+rr+".."+(r-c+1)+" bot="+cc.factorial());
   return ans
};
var BNbinomial = BNbincoeff;

// function bnbincoeffApprox(r,c){
//   var rf=r.factorialApprox(),
//       rcf=r.sub(c).factorialApprox(),
//       cf=c.factorialApprox();
//       putmsg([rf,rcf,cf].join("<br>"));
//   return rf.div(rcf).div(cf)};


function bntest(dps) {
   var ndps = BNdps();  //putmsg("globalndps="+globalndps);
   if (arguments.length == 0) {
      dps = 25
   } else if (typeof dps == "string") dps = eval(dps)
   else if (dps instanceof BigNumber) dps = dps.toNumber();
   if (dps < 3) dps = 3;
   BNsetdps(dps);  //putmsg("ndps="+ndps);
   function samestr(s, t) {
      if (typeof s != "string") s = s.toString();
      if (typeof t != "string") t = t.toString();
      if (s.length < t.length) return s == t.slice(0, s.length)
      else if (s.length == t.length) return s == t
      else return s.slice(0, t.length) == t
   };
   var tests = [
      ["BN1.exp()", "2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516642742746639193200305992181741359662904357290033429526059563073813232862794349076323382988075319525101901157383418793070215408914993488416750924476146066808226480016847741185374234544243710753907774499206955085"],
      ["BNpi", "3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196442881097566593344612847564823378678316527120190914564856692346034861045432664821339360726024914127368444"],
      ["(new BigNumber(90)).degtorad().sub(BNpi.div(2))", "0"],
      ["BNpi.div(2).radtodeg().sub(90)", "0"],
      ["(new BigNumber(45)).degtorad().sin().sqr()", "0.5"],
      ["(new BigNumber('60')).degtorad().cos()", "0.5"],
      ["BN2.arctan().tan()", "2"],
      ["(new BigNumber('0.123')).sin().arcsin()", "0.123"],
      ["(new BigNumber('0.123')).cos().arccos()", "0.123"],
      ["BNpi.sub(BN1.arctan().mul(4))", "0"],
      ["(new BigNumber('0.3')).arcsinh().sinh()", "0.3"],
      ["(new BigNumber('0.3')).cosh().arccosh()", "0.3"],
      ["(new BigNumber('0.3')).arctanh().tanh()", "0.3"],
      ["BN1.add(BNphi).sub(BNphi.sqr())", "0"],
      ["BN1.div(BNphi).sqr().add(BNphi)", "2"],
      ["BN2.exp().log()", "2"],
      ["BN1.sinh().sub(BN1.exp().div(2)).add(BN1.div(BN1.exp().mul(2)))", "0"], //sinh(1)-e/2+1/(2*e)","0"],
      ["BN1.cosh().sub(BN1.exp().div(2)).sub(BN1.div(BN1.exp().mul(2)))", "0"], //"cosh(1)-e/2-1/(2*e)","0"],
      ["BN1.tanh().sub(BN1.exp().sqr().sub(1).div(BN1.exp().sqr().inc()))", "0"], //"tanh(1)-(e^2-1)/(e^2+1)","0"]
   ];
   var ok = true, a;
   for (var i = 0; i < tests.length; i++) {
      try {
         a = eval(tests[i][0])
      } catch (e) {
         HALT("FAIL " + tests[i][0]) + ": " + e
      }
      ;
      if (a instanceof BigNumber) a = a.round(dps - 2, 4);

      var correct = (new BigNumber(tests[i][1])).round(dps - 2, 4);
      if (a.sub(correct).isZero()) {
         write(tests[i][0], " ok");
      } else {
         ok = false;
         write("TEST ", i, " failed on ", tests[i][0], " got:<br>", a, " but expected ", correct);
         STOP()
      }
      ;
   }
   BNsetdps(ndps);  //putmsg("reset ndps to "+ndps+" g="+globalndps);
   write("Test at " + dps + " dps: " + (ok ? "Passed" : "FAILED on " + tests[i][0]));
   return BN0
};

BigNumber.prototype.toBase = function (b) {
   if (b instanceof BigNumber) {
      b = b.toNumber();
      if (!isInt(b)) HALT("BigNumber tobase: base is too large")
   }
   ;
   if (!isInt(b) || b < 2 || b > 36) HALT("The base " + b + " is not an integer in range 2..35");
   return this.toString(b)
};

BigNumber.prototype.toBaseDigits = function (b) {
// return a ROW of ints, the digits of THIS in base b
   var ds = new Array(), BigNumberBaseChrs = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_";
   if (b instanceof BigNumber) {
      b = b.toNumber();
      if (!isInt(b)) HALT("BigNumber tobase: base is too large")
   }
   ;
   if (b == 0 || b == -1 || b == 1) HALT("BigNumber toBaseNbs cannot have base " + base);
   else if (1 < b && b <= 64) ds = map(this.toString(b).split(""), function (b) {
      return BigNumberBaseChrs.indexOf(b)
   })
   else {
      var r, bn = new BigNumber(this);
      while (!bn.isZero()) {
         r = bn.mod(b);
         bn = bn.divToInt(b);
         ds.unshift(r.toNumber());
         //putmsg("push "+r.toNumber());
      }
      ;
   }
   ;
   return ds
};


// ---------- Some other utility functions --------
function isInt(i) {  //is a JS value an integer?
   if (typeof i != "number" && typeof i != "string") return false;
   var s = i.toString().toLowerCase().replace(/\s/g, "");
   return !isNaN(i) && isFinite(i) && s != "" && s.indexOf(".") == -1 && s.indexOf("e") == -1 && i <= MAXINT
};