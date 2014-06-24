
'use strict';


var fs = require("fs");
var should = require("should");
var $Class = require("../class.js").$Class;




describe("定义类（原生）", function() {

    
    it("class", function(){
    
      var  AAA = function(){
          this.a = 1+2;
      };
      AAA.prototype.aa = function() {
          console.log('aa');
      };
      AAA.prototype.constructor = AAA;

      var a1 = new AAA();
      var a2 = $Class['new'](AAA);
      AAA.apply(a2);

      a1.should.have.property('a', 3);
      a2.should.have.property('a', 3);
      
      a1.should.be.an.instanceOf(AAA);
      a2.should.be.an.instanceOf(AAA);
      
      
      a1.should.have.property('aa');
      a2.should.have.property('aa');
      
      a1.should.be.ok;
      a2.should.be.ok;
    
      a1.constructor.should.be.ok;
      a2.constructor.should.be.ok;
      
      
      console.log(a1, a1.constructor,  a2, a2 instanceof AAA);

      for(var j in a1){
          console.log(j, a1[j]);
      }
      for(var k in a2){
          console.log(k, a2[k]);
      }

      console.log(a1.a==3, a2.a==3);


      //
      var A = function(){
          return {'ff':1};
      };

      var a3 = new A();
      var a4 = $Class['new'](A);
      A.apply(a4);

      console.log(a3, a4);

      a3.should.have.property('ff', 1);
      a4.should.have.property('ff', 1);
    
    });
});


describe("定义类（$Class.create）", function() {

    it("class $Class.create", function(){
    
    $Class.config({
        disguise:true
    });
    

    var AAA = $Class.create({
        __:function(){
            this.a = 1+2;
        },
        aa:function(){
            console.log('aa')
        }
    });

    var a1 = new AAA();
    var a2 = $Class['new'](AAA);
    AAA.apply(a2);

    a1.should.have.property('a', 3);
    a2.should.have.property('a', 3);
    
    a1.should.be.an.instanceOf(AAA);
    a2.should.be.an.instanceOf(AAA);
    
    
    a1.should.have.property('aa');
    a2.should.have.property('aa');
    
    a1.should.be.ok;
    a2.should.be.ok;
  
    a1.constructor.should.be.ok;
    a2.constructor.should.be.ok;



    console.log(a1, a1.constructor,  a2, a2 instanceof AAA);

    for(var j in a1){
        console.log(j, a1[j]);
    }
    for(var k in a2){
        console.log(k, a2[k]);
    }

    console.log(a1.a==3, a2.a==3);



    var A = $Class.create({
        __:function(){
            return {'ff':1};
        }
    });

    var a3 = new A();
    var a4 = A();

    console.log(a3, a4);

    a3.should.have.property('ff', 1);
    a4.should.have.property('ff', 1);
    
    
    
    
    console.log("拓展：");


    console.log("$super:",a1.constructor.$super,"$extend:", a1.constructor.$extend,"$constructor:",a1.constructor.$constructor)
    
    
    });

});


describe("继承", function() {

    it("class extend", function(){
    
        var BBB = $Class.create({
            __:function(){
                this.colors = ['red', 'blue', 'green'];
            }
        })

        var CCC = BBB.$extend({
            __:function(){
                CCC.$super.constructor.call(this);
            },
            aa:function(){}
        });


        var b1 = new BBB();
        console.log("b1", b1);
        b1.colors.push("black");
        BBB.prototype.add = 1;


        b1.colors.should.be.instanceof(Array).and.have.lengthOf(4);
        b1.should.have.property('add');

        var c1 = new CCC();
        c1.colors.push("yellow");


        c1.colors.should.be.instanceof(Array).and.have.lengthOf(4);
        c1.colors[3].should.equal('yellow');
        c1.constructor.should.equal(CCC);
        c1.constructor.prototype.should.equal(CCC.prototype);



        var c2 = $Class['new'](CCC);
        CCC.apply(c2);

        console.log(c1, c1.constructor,  c2, c2 instanceof CCC);

        c2.constructor.should.equal(CCC);
        c2.constructor.prototype.should.equal(CCC.prototype);

    });

});



describe("成员检测", function() {

var CCC = $Class.create({a:1, add:function(){}});    
var D = CCC.$extend({bb:1});
var E = D.$extend({cc:1});
var F = E.$extend({dd:1});
var G = F.$extend({ee:1});

//CCC.prototype = G.prototype;//循环的链
console.log($Class.member(G));


var H = function(){}
H.prototype={
    a1:"a1",
    constructor:{
        prototype:{
            b1:"b1",
            constructor:{
                prototype:{
                    c1:"c1",
                    constructor:{
                        prototype:{
                            c1:"c2",
                            d1:"d1",//覆盖属性
                            d2:"d2",
                            constructor:Object
                        }
                    }
                }
            } 
        }
    }
    
};



console.log($Class.member(H));

});


describe("单例类", function() {

    it("class singleton", function(){

        var S = $Class.singleton({
            __:function(){
                this.a = this.a + 1;
            },
            a:1,
            C:"创建的一个单例"
        });

        var s1 = S();
        var s2 = new S();

        s1.Name = "foo";



        s1.should.equal(s2);



        console.log(s1===s2, s1,s2 ,s2.Name, s2.a);
    });
});