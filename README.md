Class.js
========

oop javascript


  Example:
   
    //******创建类******
   
     var man  = $Class.create({
         //构造方法
         __:function(m){
             this.name = m||"uname";
 
             //私有属性
             var money = 100;
             //私有方法
             function buy(){
 
             }
             this.getmoney = function(){
                 return money;
             }
         },
         //共有属性
         sex:"男",
         //共有方法
         showname:function(){
           alert(this.name);
         }
     });
 
     var m = new man("abc");
 
    //******继承******
 
     var chunGe = $Class.inherit(man);
 
     //or
 
     var chunGe = $Class.inherit(man,{
         __:function(m){
             this.type = m||"chunGe";
 
             //私有属性
             var money = 500,baqi = 10;
             this.getmoney = function(){
                 alert(money);
             };
             this.baqi = function(){
                 alert(baqi);
             }
         },
         alse:function(){
           alert(this.sex);
         }
     });
 
     var c = new chunGe("chunchun");
 
         //检测c是否为chunGe的实例
         //alert(c instanceof chunGe);
         //检测c是否为man的实例
         //alert(c instanceof man);
         //构造函数
         //alert(c.constructor);
 
    //******包含，添加原型成员******
   
     var run = function(){
       alert("run");
     };
     var jump = function(){
       alert("jump");
     };
     var baojuhua = function(){
       alert("baojuhua");
     };
    $Class.include(chunGe,{"run":run,"jump":jump,"baojuhua":baojuhua});
 
