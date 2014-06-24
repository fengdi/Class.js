Class.js v1.4.4[![Build Status](https://travis-ci.org/fengdi/Class.js.svg?branch=master)](https://travis-ci.org/fengdi/Class.js)
========
oop javascript

## 特性 ##

- 和原生创建的类是一致的，实例化的对象不包含额外任何成员和添加剂

		var a = new A();
		for(var k in a){
			console.log(k);  //没有多余的成员
		}

- 创建的类实例化时支持可以不使用new关键字实例化 

		var a = new A();
		var a = A();         //可以省略new

- 使用的继承方式保证原型链和对象检测，尽量靠近原生继承和实例化机制
		
		sub instanceof SuperClass //true 可以用instanceof检测

		var A = $Class.create({
			__:function(){
				return {};        //实例化A时返回{}而不是实例,和原生一致
			}
		});

- 提供创建单例类的接口，单例类区别于单例对象{}, 需要实例化且可以继承
	
		var S = $Class.singleton({
			foo:function(){
				console.log('foo');
			}
		});
		var s1 = new S();
		var s2 = new S();  // s1 === s2
 


## API ##

Class.js统一的访问命名是$Class, 当你使用此库时，应该$Class.xxx(...)来调用API

#### 1.创建一个类 ####

		$Class.create( classMemberObject );

classMemberObject定义类的成员，其中属性__（双下划线）约定为构造方法。

如：
		
		var A = $Class.create({
			__:function(){
				console.log('A构造方法');
			}
		});


这里实例化的A类的成员是不包含任何污染的，`var a = new A();`可以用for in遍历检测一下a的所有成员。


#### 2.创建一个子类 ####

		$Class.inherit( SuperClass, subClassMemberObject);
SuperClass为父类，subClassMemberObject是定义子类的成员，其中属性__（双下划线）约定为构造方法。

如：
		
		var B = $Class.inherit(A, {
			__:function(){
				console.log('B构造方法');
			}
		});

或者使用父类提供的$extend方法：

		SuperClass.$extend( subClassMemberObject )

subClassMemberObject是定义子类的成员，其中属性__（双下划线）约定为构造方法。

如：

		var B = A.$extend({
			__:function(name){
				this.name = name;
				console.log('B构造方法');
			}
		});


这里创建好的B类，是可以用 instanceof 去检测的 `(new B()) instanceof A  //true`


#### 3.拓展原型成员 ####
通常使用 `A.prototype.xxx = foo;`方式拓展。
这里提供了混入的方式：

		$Class.include(Class, prototype)
如：

		$Class.include(A, {
			xxx:foo		
		});


#### 4.实例化某个类 ####
实例化类通常可以用new关键字， 这里提供了new方法，效果和new是一样的。

		$Class['new']( Class, [argsArray] );

Class为类，argsArray为参数（数组）

如：

		$Class['new'](B, ['tangobot']);  //等同于 new B('tangobot');

#### 5.单例类 ####
创建一个单例类

		$Class.singleton( [classMemberObject] )

classMemberObject是定义子类的成员，其中属性__（双下划线）约定为构造方法。

如：

		var S = $Class.singleton({foo:"foo"});
		var s1 = new S();
		var s2 = new S();
		s1 === s2;  // true
		console.log(s1.foo) //"foo"

#### 6.成员检测 ####

		$Class.member( Class );

返回某个类的原型链上所有定义的成员名称（数组）
如：

		var C = $Class.create({
			foo:'ccc',
		});
		var D = C.$extend({
			bar:'ddd'
		});
		$Class.member(D);   //['bar', 'foo']

		
		
#### 7.Base基类 ####

		$Class.Base;

所有create出来的类都是继承自内置的基类`$Class.Base`， $Class.Base继承于系统环境中的Object。

如:

		var Foo = $Class.create();  
		//继承关系为	 Foo <= $Class.Base <= Object

这里可以重写或者拓展 $Class.Base 来达到拓展Foo类的目的， 
你也可以删除$Class.Base 或者 $Class.Base = null 这样就可以改变继承为 Foo <= Object



#### 8.全局配置 ####

		$Class.config( [configObject|configName] )

配置项及默认值：

        constructorName:'__',       //构造方法约定名称，默认约定为双下划线__
		autoSuperConstructor:false, //当子类被实例化时是否先执行父类构造函数 设置后仅对后面声明的类有效
		notUseNew:true,             //是否可以不使用关键字new 直接调用方法实例化对象 如：A()
		useExtend:true,             //是否使用让类拥有拓展继承的方法 如：B = A.$extend({})
		useSuper:true,              //是否让类有$super属性访问父类成员 如：B.$super.foo()
		disguise:false,             //是否让代码生成的构造函数伪装成定义的__:function(){}
		useConstructor:true  		//是否使用B.$constructor来保存定义的__构造函数，这里create inherit生成的构造函数是不等于__的

配置后，仅对后面的生成的类才会产生效果。

如：
	
	$Class.config({notUseNew:false}); //设置后，必须用new实例化对象
